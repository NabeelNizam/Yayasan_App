import { describe, it, expect } from 'vitest'
import { normalizeCampaign } from '@/features/donasi/getCampaigns'
import { normalizeKajian } from '@/features/kajian/getList'
import { normalizeLembaga } from '@/features/lembaga/getList'
import { normalizePhbiRecap } from '@/features/recap/getList'

describe('resolve* null-url fallback branches', () => {
  it('normalizeCampaign: object image without a url -> null', () => {
    const [r] = normalizeCampaign([{ id: 1, title: 'T', slug: 's', coverImage: {} }])
    expect(r.coverImageUrl).toBeNull()
  })

  it('normalizeKajian: object pdf without a url -> null', () => {
    const [r] = normalizeKajian([{ id: 1, pdf: {} }])
    expect(r.pdfUrl).toBeNull()
  })

  it('normalizeLembaga: object image without url/alt -> nulls', () => {
    const [r] = normalizeLembaga([{ id: 1, nama: 'X', slug: 'x', profilImage: {} }])
    expect(r.imageUrl).toBeNull()
    expect(r.imageAlt).toBe('')
  })

  it('normalizePhbiRecap: missing image_url -> null', () => {
    const [r] = normalizePhbiRecap([{ id: 1, event: 'E' }])
    expect(r.imageUrl).toBeNull()
  })
})
