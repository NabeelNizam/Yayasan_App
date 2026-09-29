import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn, revalidateTag: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('@/features/kajian/renderLexical', () => ({
  renderRichText: vi.fn(async (b: unknown) => (b ? '<p>x</p>' : '')),
}))

let docs: unknown[] = []
vi.mock('payload', () => ({ getPayload: vi.fn(async () => ({ find: vi.fn(async () => ({ docs })) })) }))

import { getPrayersByCampaign, getDonorsByCampaign, getCampaignBySlug } from '@/features/donasi/getDetail'
import { getKajianBySlug } from '@/features/kajian/getBySlug'

beforeEach(() => {
  docs = []
  vi.clearAllMocks()
})

describe('getDetail fallback branches', () => {
  it('prayer with all fields missing falls back to safe defaults', async () => {
    docs = [{ id: 5 }]
    const [r] = await getPrayersByCampaign('s')
    expect(r).toEqual({ id: 5, donorName: '', isAnonymous: false, message: '', createdAt: '' })
  })

  it('donor with all fields missing falls back to safe defaults', async () => {
    docs = [{ id: 6 }]
    const [r] = await getDonorsByCampaign('s')
    expect(r).toEqual({ id: 6, name: '', amount: 0, isAnonymous: false, createdAt: '' })
  })

  it('campaign with a non-object coverImage yields a null image url', async () => {
    docs = [{ id: 7, title: 'T', slug: 's', coverImage: 12 }]
    const r = await getCampaignBySlug('s')
    expect(r?.coverImageUrl).toBeNull()
  })

  it('campaign with an object coverImage exposes its url', async () => {
    docs = [{ id: 8, title: 'T', slug: 's', coverImage: { url: '/c.jpg' } }]
    const r = await getCampaignBySlug('s')
    expect(r?.coverImageUrl).toBe('/c.jpg')
  })
})

describe('getKajianBySlug fallback branches', () => {
  it('falls back type/title/slug/youtubeId when absent', async () => {
    docs = [{ id: 9 }]
    const r = await getKajianBySlug('s')
    expect(r).toMatchObject({ id: 9, type: 'artikel', title: '', slug: '', youtubeId: null, pdfUrl: null })
  })

  it('kitab with an object pdf whose url is null yields null', async () => {
    docs = [{ id: 10, type: 'kitab', pdf: { url: null } }]
    const r = await getKajianBySlug('s')
    expect(r?.pdfUrl).toBeNull()
  })
})
