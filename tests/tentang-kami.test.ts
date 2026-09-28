import { describe, it, expect } from 'vitest'
import { normalizeTentangKami } from '@/features/tentang-kami/getContent'

describe('normalizeTentangKami', () => {
  it('returns safe empty defaults for null', () => {
    expect(normalizeTentangKami(null)).toEqual({ visi: '', misi: [], detail: '' })
  })

  it('passes through valid content', () => {
    const out = normalizeTentangKami({
      visi: 'Visi kami',
      misi: [{ teks: 'Misi 1' }, { teks: 'Misi 2' }],
      detail: 'Detail',
    })
    expect(out.visi).toBe('Visi kami')
    expect(out.misi).toEqual(['Misi 1', 'Misi 2'])
    expect(out.detail).toBe('Detail')
  })

  it('coerces missing misi to an empty array', () => {
    expect(normalizeTentangKami({ visi: 'x' }).misi).toEqual([])
  })
})
