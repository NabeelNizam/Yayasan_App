import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn, revalidateTag: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('@/features/kajian/renderLexical', () => ({
  renderRichText: vi.fn(async (body: unknown) => (body ? '<p>rendered</p>' : '')),
  sanitizeHtml: vi.fn((h: string) => h),
}))

let findOneResult: { docs: unknown[] } = { docs: [] }
vi.mock('payload', () => ({
  getPayload: vi.fn(async () => ({ find: vi.fn(async () => findOneResult) })),
}))

import { getKajianBySlug } from '@/features/kajian/getBySlug'

beforeEach(() => {
  findOneResult = { docs: [] }
  vi.clearAllMocks()
})

describe('getKajianBySlug', () => {
  it('returns null when the slug is not found', async () => {
    expect(await getKajianBySlug('missing')).toBeNull()
  })

  it('renders an artikel body to HTML', async () => {
    findOneResult = {
      docs: [{ id: 1, type: 'artikel', title: 'A', slug: 'a', body: { root: {} } }],
    }
    const r = await getKajianBySlug('a')
    expect(r?.type).toBe('artikel')
    expect(r?.html).toBe('<p>rendered</p>')
  })

  it('exposes youtubeId for a video and no HTML', async () => {
    findOneResult = { docs: [{ id: 2, type: 'video', title: 'V', slug: 'v', youtubeId: 'abc' }] }
    const r = await getKajianBySlug('v')
    expect(r?.youtubeId).toBe('abc')
    expect(r?.html).toBe('')
  })

  it('resolves a kitab PDF url', async () => {
    findOneResult = { docs: [{ id: 3, type: 'kitab', title: 'K', slug: 'k', pdf: { url: '/media/k.pdf' } }] }
    const r = await getKajianBySlug('k')
    expect(r?.pdfUrl).toBe('/media/k.pdf')
  })

  it('handles a kitab whose pdf is an unresolved id (not an object)', async () => {
    findOneResult = { docs: [{ id: 4, type: 'kitab', title: 'K2', slug: 'k2', pdf: 99 }] }
    const r = await getKajianBySlug('k2')
    expect(r?.pdfUrl).toBeNull()
  })
})
