import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn, revalidateTag: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))

let docs: unknown[] = []
vi.mock('payload', () => ({ getPayload: vi.fn(async () => ({ find: vi.fn(async () => ({ docs })) })) }))

import { getCampaignBySlug, getDonorsByCampaign, getPrayersByCampaign } from '@/features/donasi/getDetail'

beforeEach(() => {
  docs = []
  vi.clearAllMocks()
})

describe('getCampaignBySlug', () => {
  it('returns null when not found', async () => {
    expect(await getCampaignBySlug('x')).toBeNull()
  })
  it('normalizes the found campaign', async () => {
    docs = [{ id: 1, title: 'T', slug: 's', targetAmount: 10, collectedAmount: 5, donorCount: 2 }]
    const r = await getCampaignBySlug('s')
    expect(r?.slug).toBe('s')
    expect(r?.targetAmount).toBe(10)
  })
})

describe('getDonorsByCampaign', () => {
  it('maps donor docs and tolerates missing fields', async () => {
    docs = [{ id: 1, name: 'Ali', amount: 1000, isAnonymous: false, createdAt: '2024-01-01' }, { id: 2 }]
    const r = await getDonorsByCampaign('s')
    expect(r[0]).toEqual({ id: 1, name: 'Ali', amount: 1000, isAnonymous: false, createdAt: '2024-01-01' })
    expect(r[1]).toEqual({ id: 2, name: '', amount: 0, isAnonymous: false, createdAt: '' })
  })
})

describe('getPrayersByCampaign', () => {
  it('maps prayer docs and tolerates missing fields', async () => {
    docs = [{ id: 1, donorName: 'Ali', message: 'doa', isAnonymous: true, createdAt: '2024-01-01' }]
    const r = await getPrayersByCampaign('s')
    expect(r[0]).toEqual({ id: 1, donorName: 'Ali', message: 'doa', isAnonymous: true, createdAt: '2024-01-01' })
  })
})
