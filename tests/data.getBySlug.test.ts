import { describe, it, expect } from 'vitest'
import { pickOrNull } from '@/features/data/getBySlug'

describe('pickOrNull', () => {
  const items = [
    { slug: 'a', title: 'A' },
    { slug: 'b', title: 'B' },
  ]

  it('returns the matching item', () => {
    expect(pickOrNull(items, 'b')).toEqual({ slug: 'b', title: 'B' })
  })

  it('returns null when missing', () => {
    expect(pickOrNull(items, 'zzz')).toBeNull()
  })

  it('handles an empty list', () => {
    expect(pickOrNull([], 'a')).toBeNull()
  })
})
