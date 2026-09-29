import { describe, it, expect } from 'vitest'
import { clientKeyFromHeaders } from '@/features/rate-limit/clientKey'

describe('clientKeyFromHeaders', () => {
  it('uses the first x-forwarded-for IP', () => {
    expect(clientKeyFromHeaders({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' })).toBe('1.2.3.4')
  })

  it('falls back to x-real-ip', () => {
    expect(clientKeyFromHeaders({ 'x-real-ip': '9.9.9.9' })).toBe('9.9.9.9')
  })

  it('falls back to a fixed key when no IP header exists', () => {
    expect(clientKeyFromHeaders({})).toBe('unknown')
  })

  it('trims whitespace', () => {
    expect(clientKeyFromHeaders({ 'x-forwarded-for': '  2.2.2.2  ' })).toBe('2.2.2.2')
  })
})
