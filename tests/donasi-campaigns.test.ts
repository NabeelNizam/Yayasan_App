import { describe, it, expect, vi } from 'vitest'

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn, revalidateTag: vi.fn() }))

const find = vi.fn(async (_args: unknown) => ({ docs: [] }))
vi.mock('payload', () => ({ getPayload: vi.fn(async () => ({ find })) }))
vi.mock('@payload-config', () => ({ default: {} }))

import { normalizeCampaign, getCampaigns } from '@/features/donasi/getCampaigns'

describe('normalizeCampaign', () => {
  it('maps a campaign doc', () => {
    const out = normalizeCampaign([
      {
        id: 1,
        title: 'Renovasi Masjid',
        slug: 'renovasi-masjid',
        shortDescription: 'Perbaikan',
        description: 'Detail panjang',
        coverImage: { url: '/media/renovasi.jpg' },
        targetAmount: 500000000,
        collectedAmount: 345000000,
        donorCount: 234,
      },
    ])
    expect(out).toEqual([
      {
        id: 1,
        slug: 'renovasi-masjid',
        title: 'Renovasi Masjid',
        shortDescription: 'Perbaikan',
        description: 'Detail panjang',
        coverImageUrl: '/media/renovasi.jpg',
        targetAmount: 500000000,
        collectedAmount: 345000000,
        donorCount: 234,
      },
    ])
  })

  it('defaults numbers to 0 and image to null', () => {
    const out = normalizeCampaign([{ id: 2, title: 'X', slug: 'x' }])
    expect(out[0].targetAmount).toBe(0)
    expect(out[0].collectedAmount).toBe(0)
    expect(out[0].donorCount).toBe(0)
    expect(out[0].coverImageUrl).toBeNull()
  })
})

describe('getCampaigns', () => {
  it('filters isActive true with public access', async () => {
    await getCampaigns()
    const arg = find.mock.calls[0][0] as {
      collection: string
      where: { isActive: { equals: boolean } }
      overrideAccess: boolean
    }
    expect(arg.collection).toBe('campaigns')
    expect(arg.where.isActive.equals).toBe(true)
    expect(arg.overrideAccess).toBe(false)
  })
})
