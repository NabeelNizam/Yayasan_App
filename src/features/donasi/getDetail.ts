import { getPayload } from 'payload'
import config from '@payload-config'
import { PUBLIC_READ } from '@/features/data/constants'
import { normalizeCampaign, type CampaignItem } from './getCampaigns'

export type DonorListItem = {
  id: number | string
  name: string
  amount: number
  isAnonymous: boolean
  createdAt: string
}

export type PrayerListItem = {
  id: number | string
  donorName: string
  isAnonymous: boolean
  message: string
  createdAt: string
}

export async function getCampaignBySlug(slug: string): Promise<CampaignItem | null> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'campaigns',
    where: { slug: { equals: slug }, isActive: { equals: true } },
    depth: 1,
    limit: 1,
    ...PUBLIC_READ,
  })
  const [first] = normalizeCampaign(result.docs as unknown as Parameters<typeof normalizeCampaign>[0])
  return first ?? null
}

export async function getDonorsByCampaign(campaignSlug: string): Promise<DonorListItem[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'donors',
    where: { campaignSlug: { equals: campaignSlug }, isPublic: { equals: true } },
    sort: '-createdAt',
    depth: 0,
    limit: 100,
    ...PUBLIC_READ,
  })
  return result.docs.map((doc) => {
    const d = doc as unknown as {
      id: number | string
      name?: string | null
      amount?: number | null
      isAnonymous?: boolean | null
      createdAt?: string | null
    }
    return {
      id: d.id,
      name: d.name ?? '',
      amount: d.amount ?? 0,
      isAnonymous: d.isAnonymous ?? false,
      createdAt: d.createdAt ?? '',
    }
  })
}

export async function getPrayersByCampaign(campaignSlug: string): Promise<PrayerListItem[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'prayers',
    where: { campaignSlug: { equals: campaignSlug } },
    sort: '-createdAt',
    depth: 0,
    limit: 100,
    ...PUBLIC_READ,
  })
  return result.docs.map((doc) => {
    const d = doc as unknown as {
      id: number | string
      donorName?: string | null
      isAnonymous?: boolean | null
      message?: string | null
      createdAt?: string | null
    }
    return {
      id: d.id,
      donorName: d.donorName ?? '',
      isAnonymous: d.isAnonymous ?? false,
      message: d.message ?? '',
      createdAt: d.createdAt ?? '',
    }
  })
}
