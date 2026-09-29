import { describe, it, expect } from 'vitest'
import { normalizeKajian } from '@/features/kajian/getList'

describe('normalizeKajian', () => {
  it('maps a full doc', () => {
    expect(
      normalizeKajian([
        {
          id: 1,
          type: 'video',
          title: 'V',
          slug: 'v',
          youtubeId: 'abc',
          pdf: { url: '/p.pdf' },
          publishedAt: '2024-01-01',
        },
      ]),
    ).toEqual([
      { id: 1, type: 'video', title: 'V', slug: 'v', youtubeId: 'abc', pdfUrl: '/p.pdf', publishedAt: '2024-01-01' },
    ])
  })

  it('defaults type to artikel and tolerates missing fields', () => {
    const [r] = normalizeKajian([{ id: 2 }])
    expect(r.type).toBe('artikel')
    expect(r.title).toBe('')
    expect(r.slug).toBe('')
    expect(r.youtubeId).toBeNull()
    expect(r.pdfUrl).toBeNull()
    expect(r.publishedAt).toBe('')
  })

  it('ignores a pdf that is a numeric id', () => {
    const [r] = normalizeKajian([{ id: 3, type: 'kitab', pdf: 42 }])
    expect(r.pdfUrl).toBeNull()
  })
})
