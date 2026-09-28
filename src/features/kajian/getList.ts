import { getPayload } from 'payload'
import config from '@payload-config'
import { PUBLIC_READ } from '@/features/data/constants'

export type KajianType = 'video' | 'artikel' | 'kitab'

export type KajianItem = {
  id: number | string
  type: KajianType
  title: string
  slug: string
  youtubeId: string | null
  pdfUrl: string | null
  publishedAt: string
}

type RawDoc = {
  id: number | string
  type?: string | null
  title?: string | null
  slug?: string | null
  youtubeId?: string | null
  pdf?: { url?: string | null } | number | string | null
  publishedAt?: string | null
}

function resolvePdf(pdf: RawDoc['pdf']): string | null {
  if (!pdf || typeof pdf !== 'object') return null
  return pdf.url ?? null
}

export function normalizeKajian(docs: RawDoc[]): KajianItem[] {
  return docs.map((doc) => ({
    id: doc.id,
    type: (doc.type as KajianType) ?? 'artikel',
    title: doc.title ?? '',
    slug: doc.slug ?? '',
    youtubeId: doc.youtubeId ?? null,
    pdfUrl: resolvePdf(doc.pdf),
    publishedAt: doc.publishedAt ?? '',
  }))
}

export async function getKajianList(): Promise<KajianItem[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'kajian',
    sort: '-publishedAt',
    depth: 1,
    limit: 100,
    ...PUBLIC_READ,
  })
  return normalizeKajian(result.docs as unknown as RawDoc[])
}
