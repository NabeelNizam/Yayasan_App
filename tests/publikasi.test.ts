import { describe, it, expect, vi } from 'vitest'
import type { Payload } from 'payload'

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn, revalidateTag: vi.fn() }))

import { normalizePublikasi, getPublikasi } from '@/features/publikasi/getList'

describe('normalizePublikasi', () => {
  it('maps a doc to a normalized item', () => {
    const out = normalizePublikasi([
      {
        id: 1,
        title: 'Kajian Madani',
        date: '2024-08-31T00:00:00.000Z',
        slug: 'kajian-madani',
        image: { url: '/media/kajian.jpg', alt: 'Kajian' },
      },
    ])
    expect(out).toEqual([
      { id: 1, title: 'Kajian Madani', slug: 'kajian-madani', date: '2024-08-31T00:00:00.000Z', imageUrl: '/media/kajian.jpg', imageAlt: 'Kajian' },
    ])
  })

  it('handles a missing image and missing slug', () => {
    const out = normalizePublikasi([{ id: 2, title: 'Tanpa Gambar', date: '2024-01-01T00:00:00.000Z' }])
    expect(out[0].imageUrl).toBeNull()
    expect(out[0].slug).toBe('')
  })

  it('returns an empty array for no docs', () => {
    expect(normalizePublikasi([])).toEqual([])
  })
})

describe('getPublikasi', () => {
  it('queries publikasi sorted by -date with public access', async () => {
    const find = vi.fn(async (_args: unknown) => ({ docs: [] }))
    const payload = { find } as unknown as Payload
    await getPublikasi(payload)
    expect(find).toHaveBeenCalledTimes(1)
    const arg = find.mock.calls[0][0] as {
      collection: string
      sort: string
      overrideAccess: boolean
    }
    expect(arg.collection).toBe('publikasi')
    expect(arg.sort).toBe('-date')
    expect(arg.overrideAccess).toBe(false)
  })
})
