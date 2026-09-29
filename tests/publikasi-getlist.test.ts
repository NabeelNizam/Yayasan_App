import { describe, it, expect, vi } from 'vitest'
import type { Payload } from 'payload'

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn, revalidateTag: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: vi.fn() }))

import { getPublikasi } from '@/features/publikasi/getList'

describe('getPublikasi', () => {
  it('uses an injected payload (no getPayload call)', async () => {
    const { getPayload } = await import('payload')
    const find = vi.fn(async () => ({
      docs: [{ id: 1, title: 'T', slug: 's', date: '2024-01-01', image: { url: '/i.png', alt: 'a' } }],
    }))
    const injected = { find } as unknown as Payload

    const r = await getPublikasi(injected)

    expect(getPayload).not.toHaveBeenCalled()
    expect(r).toHaveLength(1)
    expect(r[0]).toMatchObject({ title: 'T', imageUrl: '/i.png', imageAlt: 'a' })
  })
})
