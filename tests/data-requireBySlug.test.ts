import { describe, it, expect, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw Object.assign(new Error('NEXT_NOT_FOUND'), { digest: 'NEXT_NOT_FOUND' })
  }),
  unstable_rethrow: vi.fn((e: unknown) => {
    if ((e as { digest?: string })?.digest?.startsWith('NEXT_')) throw e
  }),
}))

import { requireBySlug } from '@/features/data/getBySlug'

describe('requireBySlug', () => {
  it('resolves the item when found', async () => {
    const r = await requireBySlug(async () => [{ slug: 'a', title: 'A' }], 'a')
    expect(r.title).toBe('A')
  })

  it('throws (notFound) when the slug is missing', async () => {
    await expect(requireBySlug(async () => [{ slug: 'a' }], 'zzz')).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('rethrows a non-Next error as-is', async () => {
    await expect(
      requireBySlug(async () => {
        throw new Error('boom')
      }, 'a'),
    ).rejects.toThrow('boom')
  })
})
