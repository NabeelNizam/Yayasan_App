import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn, revalidateTag: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))

let globalResult: unknown = null
vi.mock('payload', () => ({ getPayload: vi.fn(async () => ({ findGlobal: vi.fn(async () => globalResult) })) }))

import { getTentangKami } from '@/features/tentang-kami/getContent'

beforeEach(() => {
  globalResult = null
  vi.clearAllMocks()
})

describe('getTentangKami', () => {
  it('returns safe defaults when the global is null', async () => {
    expect(await getTentangKami()).toEqual({ visi: '', misi: [], detail: '' })
  })

  it('reads the tentangKami group from the global', async () => {
    globalResult = { tentangKami: { visi: 'V', misi: [{ teks: 'M1' }], detail: 'D' } }
    const r = await getTentangKami()
    expect(r.visi).toBe('V')
    expect(r.misi).toEqual(['M1'])
    expect(r.detail).toBe('D')
  })

  it('returns defaults when findGlobal throws', async () => {
    const payloadMod = await import('payload')
    ;(payloadMod.getPayload as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      findGlobal: vi.fn(async () => {
        throw new Error('db down')
      }),
    })
    expect(await getTentangKami()).toEqual({ visi: '', misi: [], detail: '' })
  })
})
