import { describe, it, expect } from 'vitest'
import { decideRateLimit, type RateLimitState } from '@/features/rate-limit/core'

describe('decideRateLimit', () => {
  it('allows the first request of a fresh window', () => {
    const r = decideRateLimit({ count: 0, limit: 5, windowStart: null, now: 1000, windowMs: 60000 })
    expect(r.allowed).toBe(true)
    expect(r.nextCount).toBe(1)
    expect(r.resetAt).toBe(1000 + 60000)
  })

  it('allows while under the limit', () => {
    const r = decideRateLimit({ count: 4, limit: 5, windowStart: 1000, now: 2000, windowMs: 60000 })
    expect(r.allowed).toBe(true)
    expect(r.nextCount).toBe(5)
  })

  it('rejects at the limit', () => {
    const r = decideRateLimit({ count: 5, limit: 5, windowStart: 1000, now: 2000, windowMs: 60000 })
    expect(r.allowed).toBe(false)
    expect(r.nextCount).toBe(5)
  })

  it('resets when the window has expired', () => {
    const r = decideRateLimit({ count: 99, limit: 5, windowStart: 1000, now: 1000 + 60001, windowMs: 60000 })
    expect(r.allowed).toBe(true)
    expect(r.nextCount).toBe(1)
    expect(r.resetAt).toBe(1000 + 60001 + 60000)
  })

  it('treats a null windowStart as a fresh window', () => {
    const r = decideRateLimit({ count: 42, limit: 5, windowStart: null, now: 5000, windowMs: 1000 })
    expect(r.allowed).toBe(true)
    expect(r.nextCount).toBe(1)
  })

  it('handles limit of 0 (deny all) without counting', () => {
    const r = decideRateLimit({ count: 0, limit: 0, windowStart: null, now: 1, windowMs: 1000 })
    expect(r.allowed).toBe(false)
  })

  it('reports remaining correctly', () => {
    const r = decideRateLimit({ count: 2, limit: 5, windowStart: 1000, now: 1500, windowMs: 60000 })
    expect(r.remaining).toBe(2)
  })
})

describe('RateLimitState type', () => {
  it('is usable as a plain object', () => {
    const s: RateLimitState = { count: 1, limit: 2, windowStart: 0, now: 1, windowMs: 10 }
    expect(s.count).toBe(1)
  })
})
