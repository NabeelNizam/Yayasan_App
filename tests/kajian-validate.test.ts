import { describe, it, expect } from 'vitest'
import { validateKajian } from '@/features/kajian/validate'

describe('validateKajian', () => {
  it('video requires youtubeId', () => {
    expect(validateKajian({ type: 'video' }).ok).toBe(false)
    expect(validateKajian({ type: 'video', youtubeId: 'abc' }).ok).toBe(true)
  })
  it('artikel requires body', () => {
    expect(validateKajian({ type: 'artikel' }).ok).toBe(false)
    expect(validateKajian({ type: 'artikel', body: 'isi' }).ok).toBe(true)
  })
  it('kitab requires pdfId', () => {
    expect(validateKajian({ type: 'kitab' }).ok).toBe(false)
    expect(validateKajian({ type: 'kitab', pdfId: 'file-1' }).ok).toBe(true)
  })
})
