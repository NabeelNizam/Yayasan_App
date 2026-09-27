import { describe, it, expect } from 'vitest'
import { validateFeedback } from '@/features/contact/validate'

describe('validateFeedback', () => {
  it('rating must be 1..5', () => {
    expect(validateFeedback({ rating: 0, message: 'x' }).ok).toBe(false)
    expect(validateFeedback({ rating: 5, message: 'x' }).ok).toBe(true)
  })
  it('message required', () => {
    expect(validateFeedback({ rating: 3, message: '' }).ok).toBe(false)
  })
})
