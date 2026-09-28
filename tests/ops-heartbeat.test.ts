import { describe, it, expect } from 'vitest'
import { isStale } from '@/features/ops/heartbeat'

describe('isStale', () => {
  it('true beyond 1.5x the interval', () => {
    expect(isStale(0, 1000, 1600)).toBe(true)
  })
  it('false at or below 1.5x the interval', () => {
    expect(isStale(0, 1000, 1400)).toBe(false)
    expect(isStale(0, 1000, 1500)).toBe(false)
  })
  it('handles a freshly-succeeded job', () => {
    expect(isStale(1000, 1000, 1000)).toBe(false)
  })
})
