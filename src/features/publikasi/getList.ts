import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import { PUBLIC_READ } from '@/features/data/constants'

export type PublikasiItem = {
  id: number | string
  title: string
  slug: string
  date: string
  imageUrl: string | null
  imageAlt: string
}

type RawDoc = {
  id: number | string
  title?: string | null
  slug?: string | null
  date?: string | null
  image?: { url?: string | null; alt?: string | null } | number | string | null
}

function resolveImage(image: RawDoc['image']): { url: string | null; alt: string } {
  if (!image || typeof image !== 'object') return { url: null, alt: '' }
  return { url: image.url ?? null, alt: image.alt ?? '' }
}

export function normalizePublikasi(docs: RawDoc[]): PublikasiItem[] {
  return docs.map((doc) => {
    const { url, alt } = resolveImage(doc.image)
    return {
      id: doc.id,
      title: doc.title ?? '',
      slug: doc.slug ?? '',
      date: doc.date ?? '',
      imageUrl: url,
      imageAlt: alt,
    }
  })
}

export async function getPublikasi(payloadArg?: Payload): Promise<PublikasiItem[]> {
  const payload = payloadArg ?? (await getPayload({ config }))
  const result = await payload.find({
    collection: 'publikasi',
    sort: '-date',
    depth: 1,
    limit: 100,
    ...PUBLIC_READ,
  })
  return normalizePublikasi(result.docs as unknown as RawDoc[])
}
