import { describe, it, expect, vi } from 'vitest'
import type { Payload } from 'payload'
import { normalizeLembaga, getLembaga } from '@/features/lembaga/getList'

describe('normalizeLembaga', () => {
  it('maps docs to a normalized directory item', () => {
    const out = normalizeLembaga([
      {
        id: 1,
        nama: 'TK Al-Muhajirin',
        slug: 'tk-al-muhajirin',
        kategori: 'pendidikan',
        deskripsi: 'Pendidikan anak usia dini',
        profilImage: { url: '/media/tk.png', alt: 'TK' },
      },
    ])
    expect(out).toEqual([
      {
        id: 1,
        nama: 'TK Al-Muhajirin',
        slug: 'tk-al-muhajirin',
        kategori: 'pendidikan',
        deskripsi: 'Pendidikan anak usia dini',
        imageUrl: '/media/tk.png',
        imageAlt: 'TK',
      },
    ])
  })

  it('tolerates missing optional fields', () => {
    const out = normalizeLembaga([{ id: 2, nama: 'Takmir', slug: 'takmir' }])
    expect(out[0].kategori).toBe('')
    expect(out[0].deskripsi).toBe('')
    expect(out[0].imageUrl).toBeNull()
  })
})

describe('getLembaga', () => {
  it('filters isActive true with public access', async () => {
    const find = vi.fn(async (_args: unknown) => ({ docs: [] }))
    const payload = { find } as unknown as Payload
    await getLembaga(payload)
    const arg = find.mock.calls[0][0] as {
      collection: string
      where: { isActive: { equals: boolean } }
      overrideAccess: boolean
    }
    expect(arg.collection).toBe('lembaga')
    expect(arg.where.isActive.equals).toBe(true)
    expect(arg.overrideAccess).toBe(false)
  })
})
