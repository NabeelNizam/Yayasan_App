import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn, revalidateTag: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))

let globalResult: unknown = null
let docs: unknown[] = []
vi.mock('payload', () => ({
  getPayload: vi.fn(async () => ({
    findGlobal: vi.fn(async () => globalResult),
    find: vi.fn(async () => ({ docs })),
  })),
}))

import { getContactSettings } from '@/features/kontak/getSettings'
import { getPhbiRecapDefault } from '@/features/recap/getList'
import { isUniqueViolation } from '@/features/donation/errors'

beforeEach(() => {
  globalResult = null
  docs = []
  vi.clearAllMocks()
})

describe('getContactSettings social branches', () => {
  it('drops sosial entries without a url', async () => {
    globalResult = { sosial: [{ platform: 'Instagram' }, { platform: 'YouTube', url: 'https://y' }] }
    const r = await getContactSettings()
    expect(r.socialLinks).toHaveLength(1)
    expect(r.socialLinks[0].platform).toBe('YouTube')
  })

  it('uses a known icon and a generic id/description for an unknown platform', async () => {
    globalResult = { sosial: [{ platform: 'Threads', url: 'https://t' }] }
    const r = await getContactSettings()
    expect(r.socialLinks[0]).toMatchObject({
      id: 'threads',
      icon: 'faGlobe',
      description: 'Ikuti kami di Threads.',
    })
  })

  it('falls back to a generated id when platform is blank', async () => {
    globalResult = { sosial: [{ url: 'https://x' }] }
    const r = await getContactSettings()
    expect(r.socialLinks[0].id).toBe('social-0')
    expect(r.socialLinks[0].platform).toBe('')
  })
})

describe('getPhbiRecapDefault', () => {
  it('delegates to the cached loader', async () => {
    docs = [{ id: 1, event: 'E', year: '2024' }]
    const r = await getPhbiRecapDefault()
    expect(r[0]).toMatchObject({ id: 1, event: 'E' })
  })
})

describe('isUniqueViolation branches', () => {
  it('false when data.errors exists but mentions no unique', () => {
    expect(isUniqueViolation({ data: { errors: [{ message: 'required' }] } })).toBe(false)
  })
  it('false when the error has no data.errors array', () => {
    expect(isUniqueViolation({ data: { errors: 'nope' } })).toBe(false)
  })
})
