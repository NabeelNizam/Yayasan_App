import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import { PUBLIC_READ } from '@/features/data/constants'

export type LembagaItem = {
  id: number | string
  nama: string
  slug: string
  kategori: string
  deskripsi: string
  imageUrl: string | null
  imageAlt: string
}

type RawDoc = {
  id: number | string
  nama?: string | null
  slug?: string | null
  kategori?: string | null
  deskripsi?: string | null
  profilImage?: { url?: string | null; alt?: string | null } | number | string | null
}

function resolveImage(image: RawDoc['profilImage']): { url: string | null; alt: string } {
  if (!image || typeof image !== 'object') return { url: null, alt: '' }
  return { url: image.url ?? null, alt: image.alt ?? '' }
}

export function normalizeLembaga(docs: RawDoc[]): LembagaItem[] {
  return docs.map((doc) => {
    const { url, alt } = resolveImage(doc.profilImage)
    return {
      id: doc.id,
      nama: doc.nama ?? '',
      slug: doc.slug ?? '',
      kategori: doc.kategori ?? '',
      deskripsi: doc.deskripsi ?? '',
      imageUrl: url,
      imageAlt: alt,
    }
  })
}

export async function getLembaga(payloadArg?: Payload): Promise<LembagaItem[]> {
  const payload = payloadArg ?? (await getPayload({ config }))
  const result = await payload.find({
    collection: 'lembaga',
    where: { isActive: { equals: true } },
    sort: 'nama',
    depth: 1,
    limit: 100,
    ...PUBLIC_READ,
  })
  return normalizeLembaga(result.docs as unknown as RawDoc[])
}
