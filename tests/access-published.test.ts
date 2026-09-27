import { describe, it, expect } from 'vitest'
import { readPublished, readPublicDonors, readPublicNoDraft } from '@/access/published'

const asAccess = (fn: unknown) => fn as (args: { req: { user: unknown } }) => unknown

describe('published access', () => {
  it('readPublished returns Where for anonymous', () => {
    expect(asAccess(readPublished)({ req: { user: null } })).toEqual({
      _status: { equals: 'published' },
    })
  })
  it('readPublished returns true for authenticated user', () => {
    expect(asAccess(readPublished)({ req: { user: { id: '1' } } })).toBe(true)
  })
  it('readPublicDonors returns isPublic Where (not true)', () => {
    expect(asAccess(readPublicDonors)({ req: { user: null } })).toEqual({
      isPublic: { equals: true },
    })
  })
  it('readPublicNoDraft returns true', () => {
    expect(asAccess(readPublicNoDraft)({ req: { user: null } })).toBe(true)
  })
})
