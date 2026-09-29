import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }))
vi.mock('next/headers', () => ({ headers: vi.fn(async () => new Map([['x-forwarded-for', '10.0.0.1']])) }))
vi.mock('@/features/rate-limit/check', () => ({
  checkRateLimit: vi.fn(async () => ({ allowed: true, nextCount: 1, resetAt: 0, remaining: 99 })),
}))

const created: Record<string, unknown>[] = []
const payloadDouble = {
  create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
    const doc = { id: created.length + 1, ...data }
    created.push(doc)
    return doc
  }),
}
vi.mock('payload', () => ({ getPayload: vi.fn(async () => payloadDouble) }))
vi.mock('@payload-config', () => ({ default: {} }))

import { submitFeedback } from '@/features/contact/actions'

const base = { rating: 5, message: 'Pelayanan bagus', honeypot: '' }

beforeEach(() => {
  created.length = 0
  vi.clearAllMocks()
})

describe('submitFeedback', () => {
  it('stores a valid feedback and returns ok', async () => {
    const r = await submitFeedback(base)
    expect(r.ok).toBe(true)
    expect(created).toHaveLength(1)
  })

  it('rejects (and does not store) when the honeypot is filled', async () => {
    const r = await submitFeedback({ ...base, honeypot: 'bot' })
    expect(r.ok).toBe(false)
    expect(created).toHaveLength(0)
  })

  it('rejects an invalid rating without storing', async () => {
    const r = await submitFeedback({ ...base, rating: 9 })
    expect(r.ok).toBe(false)
    expect(created).toHaveLength(0)
  })

  it('rejects when the rate limit denies (no row stored)', async () => {
    const { checkRateLimit } = await import('@/features/rate-limit/check')
    ;(checkRateLimit as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      allowed: false,
      nextCount: 5,
      resetAt: 0,
      remaining: 0,
    })
    const r = await submitFeedback(base)
    expect(r.ok).toBe(false)
    expect(created).toHaveLength(0)
  })
})
