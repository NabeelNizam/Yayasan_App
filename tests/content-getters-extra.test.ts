import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn, revalidateTag: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))

let docs: unknown[] = []
vi.mock('payload', () => ({ getPayload: vi.fn(async () => ({ find: vi.fn(async () => ({ docs })) })) }))

import { normalizeLembaga, getLembaga } from '@/features/lembaga/getList'
import { normalizePhbiRecap, getPhbiRecap } from '@/features/recap/getList'
import { getContactSettings } from '@/features/kontak/getSettings'

beforeEach(() => {
  docs = []
  vi.clearAllMocks()
})

describe('getLembaga', () => {
  it('maps docs and tolerates missing fields', async () => {
    docs = [{ id: 1, nama: 'TK', slug: 'tk', kategori: 'pendidikan', deskripsi: 'd', profilImage: { url: '/i.png', alt: 'x' } }, { id: 2 }]
    const got = await getLembaga()
    expect(got).toHaveLength(2)
    expect(got[0].imageUrl).toBe('/i.png')
    expect(got[1]).toMatchObject({ nama: '', slug: '', kategori: '', deskripsi: '', imageUrl: null, imageAlt: '' })
  })

  it('normalizeLembaga handles a non-object image', () => {
    const [r] = normalizeLembaga([{ id: 3, nama: 'X', slug: 'x', profilImage: 42 }])
    expect(r.imageUrl).toBeNull()
  })
})

describe('getPhbiRecap', () => {
  it('maps recap docs', async () => {
    docs = [{ id: 1, event: 'Idul Adha', year: '2024', date: '10 Juni', description: 'd', image_url: '/a.jpg' }]
    const r = await getPhbiRecap()
    expect(r[0]).toEqual({ id: 1, event: 'Idul Adha', year: '2024', date: '10 Juni', description: 'd', imageUrl: '/a.jpg' })
  })
  it('normalizer tolerates missing fields', () => {
    const [r] = normalizePhbiRecap([{ id: 2, event: 'E' }])
    expect(r.year).toBe('')
    expect(r.imageUrl).toBeNull()
  })
})

describe('getContactSettings error path', () => {
  it('returns defaults when findGlobal throws', async () => {
    const payloadMod = await import('payload')
    ;(payloadMod.getPayload as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      findGlobal: vi.fn(async () => {
        throw new Error('down')
      }),
    })
    const r = await getContactSettings()
    expect(r.contactInfo).toEqual([])
    expect(r.socialLinks).toEqual([])
    expect(r.mapEmbedUrl).toBe('')
  })
})
