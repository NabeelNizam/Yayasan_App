import { describe, it, expect } from 'vitest'
import { toPercent } from '@/components/ui/ProgressBar'

describe('toPercent', () => {
  it('computes a rounded percentage', () => {
    expect(toPercent(50, 200)).toBe(25)
    expect(toPercent(1, 3)).toBe(33)
  })

  it('clamps above 100', () => {
    expect(toPercent(300, 200)).toBe(100)
  })

  it('clamps below 0', () => {
    expect(toPercent(-10, 200)).toBe(0)
  })

  it('returns 0 when max is 0 or negative', () => {
    expect(toPercent(50, 0)).toBe(0)
    expect(toPercent(50, -5)).toBe(0)
  })
})
