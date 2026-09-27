import { describe, it, expect } from 'vitest'
import { shouldAccept } from '@/features/outbox/idempotency'

describe('shouldAccept', () => {
  const key = (e: string, h: string) => `${e}:${h}`
  it('accepts new event', () => {
    expect(shouldAccept(new Map(), key('evt1', 'a'))).toBe('accept')
  })
  it('accepts duplicate same-hash (idempotent)', () => {
    const seen = new Map([[key('evt1', 'a'), 'processing']])
    expect(shouldAccept(seen, key('evt1', 'a'))).toBe('duplicate')
  })
  it('rejects same id different hash (fail closed)', () => {
    const seen = new Map([[key('evt1', 'a'), 'done']])
    expect(shouldAccept(seen, key('evt1', 'b'))).toBe('reject')
  })
})
