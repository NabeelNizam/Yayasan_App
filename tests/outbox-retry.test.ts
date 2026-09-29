import { describe, it, expect } from 'vitest'
import { decideOutcome, backoffMs, MAX_ATTEMPTS } from '@/features/outbox/retry'

describe('decideOutcome', () => {
  it('marks done on success', () => {
    expect(decideOutcome({ ok: true, attempts: 0 })).toEqual({ status: 'done', attempts: 0, retryAt: null })
  })

  it('retries with attempts+1 while under MAX on failure', () => {
    const r = decideOutcome({ ok: false, attempts: 0 })
    expect(r.status).toBe('pending')
    expect(r.attempts).toBe(1)
    expect(r.retryAt).toBeInstanceOf(Date)
  })

  it('marks dead when attempts reach MAX', () => {
    const r = decideOutcome({ ok: false, attempts: MAX_ATTEMPTS - 1 })
    expect(r.status).toBe('dead')
    expect(r.attempts).toBe(MAX_ATTEMPTS)
  })
})

describe('backoffMs', () => {
  it('grows with attempts', () => {
    expect(backoffMs(1)).toBeLessThan(backoffMs(2))
    expect(backoffMs(2)).toBeLessThan(backoffMs(3))
  })
  it('is capped', () => {
    expect(backoffMs(50)).toBeLessThanOrEqual(60 * 60 * 1000)
  })
})
