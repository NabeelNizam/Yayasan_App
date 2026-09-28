import { describe, it, expect } from 'vitest'
import { sanitizeHtml } from '@/features/kajian/renderLexical'

describe('sanitizeHtml', () => {
  it('keeps safe formatting tags', () => {
    const out = sanitizeHtml('<p>Halo <strong>umat</strong></p>')
    expect(out).toContain('<strong>umat</strong>')
  })

  it('strips script tags and their content', () => {
    const out = sanitizeHtml('<p>ok</p><script>alert(1)</script>')
    expect(out).not.toContain('<script')
    expect(out).not.toContain('alert(1)')
  })

  it('strips inline event handlers', () => {
    const out = sanitizeHtml('<img src="x" onerror="alert(1)">')
    expect(out).not.toContain('onerror')
  })

  it('returns empty string for null/undefined', () => {
    expect(sanitizeHtml(null)).toBe('')
    expect(sanitizeHtml(undefined)).toBe('')
  })
})
