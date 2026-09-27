import { describe, it, expect } from 'vitest'
import { ManualPaymentProvider } from '@/features/donation/provider'

describe('ManualPaymentProvider', () => {
  it('has stable id and does not invent a gateway', () => {
    const p = new ManualPaymentProvider()
    expect(p.id).toBe('manual')
  })
  it('returns a MANUAL orderId from campaignSlug', async () => {
    const p = new ManualPaymentProvider()
    const r = await p.createTransaction({
      campaignSlug: 'renovasi',
      amount: 50000,
      donorName: 'Ali',
      anonymous: false,
    })
    expect(r.orderId).toContain('MANUAL-renovasi')
  })
})
