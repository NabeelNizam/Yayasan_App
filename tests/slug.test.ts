import { describe, it, expect } from 'vitest'
import { toSlug } from '@/lib/slug'

describe('toSlug', () => {
  it('lowercases and hyphenates', () => {
    expect(toSlug('TK Al-Muhajirin')).toBe('tk-al-muhajirin')
    expect(toSlug('Takmir  Masjid')).toBe('takmir-masjid')
  })
})
