import { describe, it, expect, vi } from 'vitest'
import { registerWebhookHandler, getWebhookHandler, availableProviders } from '@/features/outbox/handlers'

describe('webhook handler registry', () => {
  it('returns undefined for an unknown provider', () => {
    expect(getWebhookHandler('nope-xyz')).toBeUndefined()
  })

  it('registers and retrieves a handler', async () => {
    const fn = vi.fn(async () => {})
    registerWebhookHandler('testprov', fn)
    expect(getWebhookHandler('testprov')).toBe(fn)
    await getWebhookHandler('testprov')!({ provider: 'testprov', eventId: 'e1', payload: {} })
    expect(fn).toHaveBeenCalledOnce()
  })

  it('exposes the list of registered providers', () => {
    registerWebhookHandler('prov-a', async () => {})
    expect(availableProviders()).toContain('prov-a')
  })

  it('rejects an empty provider name', () => {
    expect(() => registerWebhookHandler('', async () => {})).toThrow()
  })
})
