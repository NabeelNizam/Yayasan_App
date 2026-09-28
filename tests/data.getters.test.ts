import { describe, it, expect } from 'vitest'
import {
  REVALIDATE_SECONDS,
  PHBI_TAG,
  PUBLIC_READ,
  tagged,
} from '@/features/data/getters'

describe('public data getters contract', () => {
  it('exposes a 300s revalidate window', () => {
    expect(REVALIDATE_SECONDS).toBe(300)
  })

  it('exposes the phbi cache tag', () => {
    expect(PHBI_TAG).toBe('phbi')
  })

  it('public reads are access-controlled (overrideAccess:false)', () => {
    expect(PUBLIC_READ).toEqual({ overrideAccess: false })
  })

  it('tagged() returns a callable loader', () => {
    const load = tagged(['k'], ['t'], async () => 42)
    expect(typeof load).toBe('function')
  })
})
