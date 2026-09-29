import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@payloadcms/richtext-lexical/html-async', () => ({
  convertLexicalToHTMLAsync: vi.fn(async () => '<p>halo <script>alert(1)</script></p>'),
}))
vi.mock('isomorphic-dompurify', () => ({
  default: { sanitize: vi.fn((html: string) => html.replace(/<script[\s\S]*?<\/script>/g, '')) },
}))

import { renderRichText } from '@/features/kajian/renderLexical'
import { convertLexicalToHTMLAsync } from '@payloadcms/richtext-lexical/html-async'

beforeEach(() => vi.clearAllMocks())

describe('renderRichText', () => {
  it('returns empty string for null/undefined data', async () => {
    expect(await renderRichText(null)).toBe('')
    expect(await renderRichText(undefined)).toBe('')
  })

  it('converts then sanitizes, stripping script tags', async () => {
    const out = await renderRichText({ root: {} } as never)
    expect(convertLexicalToHTMLAsync).toHaveBeenCalledOnce()
    expect(out).not.toContain('<script')
    expect(out).toContain('halo')
  })
})
