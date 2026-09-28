import { describe, it, expect, vi } from 'vitest'

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn, revalidateTag: vi.fn() }))

const calls: { collection: string; where?: unknown }[] = []
const find = vi.fn(async (args: { collection: string; where?: unknown; limit?: number }) => {
  calls.push({ collection: args.collection, where: args.where })
  if (args.collection === 'campaigns') {
    return { docs: [{ id: 1, title: 'Renovasi', slug: 'renovasi-masjid', targetAmount: 100, collectedAmount: 40, donorCount: 2 }] }
  }
  if (args.collection === 'donors') {
    return { docs: [{ id: 10, name: 'Ali', amount: 25000, isAnonymous: false, createdAt: '2024-01-01T00:00:00.000Z' }] }
  }
  if (args.collection === 'prayers') {
    return { docs: [{ id: 20, donorName: 'Ali', isAnonymous: false, message: 'Semoga berkah', createdAt: '2024-01-01T00:00:00.000Z' }] }
  }
  return { docs: [] }
})
vi.mock('payload', () => ({ getPayload: vi.fn(async () => ({ find })) }))
vi.mock('@payload-config', () => ({ default: {} }))

import { getDonorsByCampaign, getPrayersByCampaign } from '@/features/donasi/getDetail'

describe('getDonorsByCampaign', () => {
  it('queries donors by campaignSlug and isPublic with public access', async () => {
    calls.length = 0
    await getDonorsByCampaign('renovasi-masjid')
    const arg = calls.find((c) => c.collection === 'donors')!
    const where = arg.where as {
      campaignSlug: { equals: string }
      isPublic: { equals: boolean }
    }
    expect(where.campaignSlug.equals).toBe('renovasi-masjid')
    expect(where.isPublic.equals).toBe(true)
    const findArg = find.mock.calls.find((c) => (c[0] as { collection: string }).collection === 'donors')![0] as unknown as {
      overrideAccess: boolean
    }
    expect(findArg.overrideAccess).toBe(false)
  })
})

describe('getPrayersByCampaign', () => {
  it('queries prayers by campaignSlug', async () => {
    calls.length = 0
    await getPrayersByCampaign('renovasi-masjid')
    const arg = calls.find((c) => c.collection === 'prayers')!
    const where = arg.where as { campaignSlug: { equals: string } }
    expect(where.campaignSlug.equals).toBe('renovasi-masjid')
  })
})
