import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidateTag: vi.fn(), revalidatePath: vi.fn() }))
vi.mock('next/headers', () => ({ headers: vi.fn(async () => new Map([['x-forwarded-for', '10.0.0.3']])) }))
vi.mock('@payload-config', () => ({ default: {} }))

let rateAllowed = true
vi.mock('@/features/rate-limit/check', () => ({
  checkRateLimit: vi.fn(async () => ({ allowed: rateAllowed, nextCount: 1, resetAt: 0, remaining: 0 })),
}))

type CreateCall = { collection: string; data: Record<string, unknown> }
let created: CreateCall[] = []
let findDocs: Record<string, unknown>[] = []
let createImpl: (c: CreateCall) => Promise<unknown>
const commit = vi.fn(async () => {})
const rollback = vi.fn(async () => {})

vi.mock('payload', () => ({
  getPayload: vi.fn(async () => ({
    find: vi.fn(async () => ({ docs: findDocs })),
    create: vi.fn(async (c: CreateCall) => {
      created.push(c)
      return createImpl(c)
    }),
    db: { beginTransaction: vi.fn(async () => 7), commitTransaction: commit, rollbackTransaction: rollback },
  })),
}))

import { submitDonation } from '@/features/donation/actions'

const base = {
  campaignSlug: 'renovasi-masjid',
  clientToken: 'tok-12345678',
  donorName: 'Ali Akbar',
  anonymous: false,
  whatsapp: '081234567890',
  amount: 50000,
}

beforeEach(() => {
  created = []
  findDocs = []
  rateAllowed = true
  createImpl = async (c) => ({ id: created.length, ...c.data })
  vi.clearAllMocks()
})

describe('submitDonation critical paths', () => {
  it('rejects when the rate limit denies, creating nothing', async () => {
    rateAllowed = false
    const r = await submitDonation(base)
    expect(r.ok).toBe(false)
    expect(created).toHaveLength(0)
  })

  it('creates a prayer alongside the donor when a prayer is provided', async () => {
    const r = await submitDonation({ ...base, prayer: 'Semoga berkah' })
    expect(r.ok).toBe(true)
    const collections = created.map((c) => c.collection)
    expect(collections).toContain('donors')
    expect(collections).toContain('prayers')
    const prayer = created.find((c) => c.collection === 'prayers')!
    expect(prayer.data.message).toBe('Semoga berkah')
    expect(commit).toHaveBeenCalledOnce()
  })

  it('does not create a prayer when none is given', async () => {
    await submitDonation(base)
    expect(created.map((c) => c.collection)).not.toContain('prayers')
  })

  it('recovers from a unique-violation race by re-finding and deduping', async () => {
    createImpl = async () => {
      throw Object.assign(new Error('Value must be unique'), { name: 'ValidationError' })
    }
    // A true race: the pre-find miss, then the insert hits the unique index.
    // After rollback the action re-finds and finds the winner it lost to.
    let findCalls = 0
    const payloadMod = await import('payload')
    ;(payloadMod.getPayload as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(async () => ({
      find: vi.fn(async () => {
        findCalls++
        return { docs: findCalls === 1 ? [] : [{ id: 1, orderId: 'MANUAL-EXISTING' }] }
      }),
      create: vi.fn(async (c: CreateCall) => createImpl(c)),
      db: { beginTransaction: vi.fn(async () => 7), commitTransaction: commit, rollbackTransaction: rollback },
    }))
    const r = await submitDonation(base)
    expect(r.ok).toBe(true)
    expect((r as { deduped?: boolean }).deduped).toBe(true)
    expect((r as { orderId?: string }).orderId).toBe('MANUAL-EXISTING')
    expect(rollback).toHaveBeenCalledOnce()
  })

  it('rolls back and rethrows on a non-unique failure', async () => {
    createImpl = async () => {
      throw new Error('network down')
    }
    await expect(submitDonation(base)).rejects.toThrow('network down')
    expect(rollback).toHaveBeenCalledOnce()
  })
})
