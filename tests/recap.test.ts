import { describe, it, expect, vi } from 'vitest'

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn, revalidateTag: vi.fn() }))

const find = vi.fn(async (_args: unknown) => ({ docs: [] }))
vi.mock('payload', () => ({
  getPayload: vi.fn(async () => ({ find })),
}))
vi.mock('@payload-config', () => ({ default: {} }))

import { normalizePhbiRecap, getPhbiRecap } from '@/features/recap/getList'

describe('normalizePhbiRecap', () => {
  it('maps docs to a normalized recap item', () => {
    const out = normalizePhbiRecap([
      { id: 1, event: 'Idul Adha', year: '2024', date: '10 Juni 2024', description: 'qurban', image_url: '/media/a.jpg' },
    ])
    expect(out).toEqual([
      {
        id: 1,
        event: 'Idul Adha',
        year: '2024',
        date: '10 Juni 2024',
        description: 'qurban',
        imageUrl: '/media/a.jpg',
      },
    ])
  })

  it('tolerates missing optional fields', () => {
    const out = normalizePhbiRecap([{ id: 2, event: 'Ramadhan' }])
    expect(out[0].year).toBe('')
    expect(out[0].date).toBe('')
    expect(out[0].imageUrl).toBeNull()
  })
})

describe('getPhbiRecap', () => {
  it('queries phbi-recap with public access', async () => {
    await getPhbiRecap()
    const arg = find.mock.calls[0][0] as { collection: string; overrideAccess: boolean }
    expect(arg.collection).toBe('phbi-recap')
    expect(arg.overrideAccess).toBe(false)
  })
})
