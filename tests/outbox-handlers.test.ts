import { describe, it, expect, vi } from 'vitest'
import { registerWebhookHandler, getWebhookHandler, availableProviders, resetWebhookHandlers, defaultWebhookHandler } from '@/features/outbox/handlers'

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

  it('resetWebhookHandlers clears the registry', () => {
    registerWebhookHandler('temp-prov', async () => {})
    resetWebhookHandlers()
    expect(availableProviders()).toEqual([])
    expect(getWebhookHandler('temp-prov')).toBeUndefined()
  })

  it('defaultWebhookHandler resolves without side effects', async () => {
    await expect(
      defaultWebhookHandler({ provider: 'x', eventId: 'e', payload: {} }),
    ).resolves.toBeUndefined()
  })
})
