import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import { PHBI_TAG, PUBLIC_READ, REVALIDATE_SECONDS } from '@/features/data/constants'
import { tagged } from '@/features/data/getters'

export type RecapItem = {
  id: number | string
  event: string
  year: string
  date: string
  description: string
  imageUrl: string | null
}

type RawDoc = {
  id: number | string
  event?: string | null
  year?: string | null
  date?: string | null
  description?: string | null
  image_url?: string | null
}

export function normalizePhbiRecap(docs: RawDoc[]): RecapItem[] {
  return docs.map((doc) => ({
    id: doc.id,
    event: doc.event ?? '',
    year: doc.year ?? '',
    date: doc.date ?? '',
    description: doc.description ?? '',
    imageUrl: doc.image_url ?? null,
  }))
}

async function loadRecap(): Promise<RecapItem[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'phbi-recap',
    sort: '-year',
    depth: 0,
    limit: 100,
    ...PUBLIC_READ,
  })
  return normalizePhbiRecap(result.docs as unknown as RawDoc[])
}

export const getPhbiRecap = tagged<[], RecapItem[]>(['phbi-recap'], [PHBI_TAG], loadRecap)

export function getPhbiRecapDefault(): Promise<RecapItem[]> {
  return getPhbiRecap()
}

export { REVALIDATE_SECONDS }
