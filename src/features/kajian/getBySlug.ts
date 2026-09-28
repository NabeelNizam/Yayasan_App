import { getPayload } from 'payload'
import config from '@payload-config'
import { PUBLIC_READ } from '@/features/data/constants'
import { renderRichText } from './renderLexical'
import type { KajianType } from './getList'

export type KajianDetail = {
  id: number | string
  type: KajianType
  title: string
  slug: string
  youtubeId: string | null
  pdfUrl: string | null
  html: string
}

export async function getKajianBySlug(slug: string): Promise<KajianDetail | null> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'kajian',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
    ...PUBLIC_READ,
  })
  const doc = result.docs[0] as unknown as
    | {
        id: number | string
        type?: string | null
        title?: string | null
        slug?: string | null
        youtubeId?: string | null
        pdf?: { url?: string | null } | number | string | null
        body?: unknown
      }
    | undefined
  if (!doc) return null

  const html = doc.type === 'artikel' ? await renderRichText(doc.body as never) : ''

  return {
    id: doc.id,
    type: (doc.type as KajianType) ?? 'artikel',
    title: doc.title ?? '',
    slug: doc.slug ?? '',
    youtubeId: doc.youtubeId ?? null,
    pdfUrl: doc.pdf && typeof doc.pdf === 'object' ? (doc.pdf.url ?? null) : null,
    html,
  }
}
