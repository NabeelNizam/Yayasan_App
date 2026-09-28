import { describe, it, expect, vi } from 'vitest'

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn, revalidateTag: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))

const find = vi.fn(async (_args: unknown) => ({ docs: [] }))
const findOne = vi.fn(async (_args: unknown) => ({ docs: [] }))
vi.mock('payload', () => ({ getPayload: vi.fn(async () => ({ find, findOne })) }))

import { getKajianList } from '@/features/kajian/getList'

describe('getKajianList', () => {
  it('queries kajian with public access', async () => {
    await getKajianList()
    const arg = find.mock.calls[0][0] as { collection: string; overrideAccess: boolean }
    expect(arg.collection).toBe('kajian')
    expect(arg.overrideAccess).toBe(false)
  })
})
