import DOMPurify from 'isomorphic-dompurify'
import { convertLexicalToHTMLAsync } from '@payloadcms/richtext-lexical/html-async'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return ''
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  })
}

/**
 * Convert a Payload Lexical value to sanitized HTML. The official converter
 * does NOT sanitize, so DOMPurify runs after it.
 */
export async function renderRichText(
  data: SerializedEditorState | null | undefined,
): Promise<string> {
  if (!data) return ''
  const html = await convertLexicalToHTMLAsync({ data })
  return sanitizeHtml(html)
}
