import { describe, it, expect } from 'vitest'
import { donationSchema, DONATION_LIMITS } from '@/features/donation/schema'
import { contactSchema } from '@/features/contact/schema'

const valid = {
  campaignSlug: 'renovasi-masjid',
  clientToken: 'tok-12345678',
  donorName: 'Ali Akbar',
  anonymous: false,
  whatsapp: '081234567890',
  amount: 50000,
}

describe('donationSchema', () => {
  it('accepts a valid donation', () => {
    expect(donationSchema.safeParse(valid).success).toBe(true)
  })
  it('rejects amount below MIN', () => {
    const r = donationSchema.safeParse({ ...valid, amount: DONATION_LIMITS.MIN - 1 })
    expect(r.success).toBe(false)
  })
  it('rejects amount above MAX', () => {
    const r = donationSchema.safeParse({ ...valid, amount: DONATION_LIMITS.MAX + 1 })
    expect(r.success).toBe(false)
  })
  it('rejects a bad WhatsApp number', () => {
    expect(donationSchema.safeParse({ ...valid, whatsapp: 'abc' }).success).toBe(false)
  })
  it('accepts an empty email but rejects a bad one', () => {
    expect(donationSchema.safeParse({ ...valid, email: '' }).success).toBe(true)
    expect(donationSchema.safeParse({ ...valid, email: 'nope' }).success).toBe(false)
  })
  it('requires a clientToken of at least 8 chars', () => {
    expect(donationSchema.safeParse({ ...valid, clientToken: 'short' }).success).toBe(false)
  })
  it('requires a name of at least 3 chars for a named donation', () => {
    expect(donationSchema.safeParse({ ...valid, donorName: 'ab' }).success).toBe(false)
    expect(donationSchema.safeParse({ ...valid, donorName: '  ' }).success).toBe(false)
  })
  it('allows an empty name when the donation is anonymous', () => {
    const r = donationSchema.safeParse({ ...valid, anonymous: true, donorName: '' })
    expect(r.success).toBe(true)
  })
})

describe('contactSchema', () => {
  const base = { rating: 5, message: 'Bagus sekali', honeypot: '' }
  it('accepts a valid feedback', () => {
    expect(contactSchema.safeParse(base).success).toBe(true)
  })
  it('rejects rating outside 1..5', () => {
    expect(contactSchema.safeParse({ ...base, rating: 0 }).success).toBe(false)
    expect(contactSchema.safeParse({ ...base, rating: 6 }).success).toBe(false)
  })
  it('rejects empty message', () => {
    expect(contactSchema.safeParse({ ...base, message: '' }).success).toBe(false)
  })
  it('rejects a filled honeypot', () => {
    expect(contactSchema.safeParse({ ...base, honeypot: 'bot' }).success).toBe(false)
  })
})
