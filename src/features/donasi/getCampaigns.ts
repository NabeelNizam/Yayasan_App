import { getPayload } from 'payload'
import config from '@payload-config'
import { PUBLIC_READ } from '@/features/data/constants'

export type CampaignItem = {
  id: number | string
  slug: string
  title: string
  shortDescription: string
  description: string
  coverImageUrl: string | null
  targetAmount: number
  collectedAmount: number
  donorCount: number
}

type RawDoc = {
  id: number | string
  title?: string | null
  slug?: string | null
  shortDescription?: string | null
  description?: string | null
  coverImage?: { url?: string | null } | number | string | null
  targetAmount?: number | null
  collectedAmount?: number | null
  donorCount?: number | null
}

function resolveImage(image: RawDoc['coverImage']): string | null {
  if (!image || typeof image !== 'object') return null
  return image.url ?? null
}

export function normalizeCampaign(docs: RawDoc[]): CampaignItem[] {
  return docs.map((doc) => ({
    id: doc.id,
    slug: doc.slug ?? '',
    title: doc.title ?? '',
    shortDescription: doc.shortDescription ?? '',
    description: doc.description ?? '',
    coverImageUrl: resolveImage(doc.coverImage),
    targetAmount: doc.targetAmount ?? 0,
    collectedAmount: doc.collectedAmount ?? 0,
    donorCount: doc.donorCount ?? 0,
  }))
}

export async function getCampaigns(): Promise<CampaignItem[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'campaigns',
    where: { isActive: { equals: true } },
    sort: 'title',
    depth: 1,
    limit: 100,
    ...PUBLIC_READ,
  })
  return normalizeCampaign(result.docs as unknown as RawDoc[])
}
