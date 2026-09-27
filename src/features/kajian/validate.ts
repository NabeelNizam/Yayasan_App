export type KajianType = 'video' | 'artikel' | 'kitab'

export type KajianInput = {
  type: KajianType
  youtubeId?: string
  body?: string
  pdfId?: string
}

export function validateKajian(input: KajianInput): { ok: boolean; error?: string } {
  if (input.type === 'video' && !input.youtubeId) return { ok: false, error: 'youtubeId wajib' }
  if (input.type === 'artikel' && !input.body) return { ok: false, error: 'body wajib' }
  if (input.type === 'kitab' && !input.pdfId) return { ok: false, error: 'pdf wajib' }
  return { ok: true }
}
