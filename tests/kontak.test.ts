import { describe, it, expect, vi } from 'vitest'

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn, revalidateTag: vi.fn() }))

const findGlobal = vi.fn(async (_args: unknown) => ({
  kontak: { email: 'a@b.com', phone: '0341', address: 'Jl. X', mapEmbedUrl: 'https://maps/embed', hours: '07-22' },
  sosial: [{ platform: 'Instagram', url: 'https://instagram.com/x' }],
}))
vi.mock('payload', () => ({ getPayload: vi.fn(async () => ({ findGlobal })) }))
vi.mock('@payload-config', () => ({ default: {} }))

import { normalizeContactSettings, getContactSettings } from '@/features/kontak/getSettings'

describe('normalizeContactSettings', () => {
  it('maps global settings into contact info + social links + map', () => {
    const out = normalizeContactSettings({
      kontak: { email: 'a@b.com', phone: '0341', address: 'Jl. X', mapEmbedUrl: 'https://maps/embed', hours: '07-22' },
      sosial: [{ platform: 'Instagram', url: 'https://instagram.com/x' }],
    })
    expect(out.contactInfo.map((c) => c.id)).toEqual(['email', 'phone', 'address'])
    expect(out.contactInfo.find((c) => c.id === 'email')?.value).toBe('a@b.com')
    expect(out.socialLinks[0]).toMatchObject({ platform: 'Instagram', url: 'https://instagram.com/x' })
    expect(out.mapEmbedUrl).toBe('https://maps/embed')
    expect(out.hours).toBe('07-22')
  })

  it('returns safe defaults for null', () => {
    const out = normalizeContactSettings(null)
    expect(out.contactInfo).toEqual([])
    expect(out.socialLinks).toEqual([])
    expect(out.mapEmbedUrl).toBe('')
  })
})

describe('getContactSettings', () => {
  it('reads the site-settings global with select + public access', async () => {
    await getContactSettings()
    const arg = findGlobal.mock.calls[0][0] as {
      slug: string
      overrideAccess: boolean
      select?: Record<string, boolean>
    }
    expect(arg.slug).toBe('site-settings')
    expect(arg.overrideAccess).toBe(false)
    expect(arg.select).toMatchObject({ kontak: true, sosial: true })
  })
})
