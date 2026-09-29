import { getPayload } from 'payload'
import config from '@payload-config'
import { RUN_TAG } from './db'

/**
 * The /donasi/[slug] page reads campaigns from the database, and the table is
 * empty, so the donation form cannot be reached without a campaign. This seeds
 * one published campaign for the run and removes it afterwards, leaving the DB
 * as it was found.
 */

export const E2E_CAMPAIGN_SLUG = `e2e-campaign-${RUN_TAG.toLowerCase()}`

export async function seedCampaign(): Promise<number | string> {
  const payload = await getPayload({ config })
  const created = await payload.create({
    collection: 'campaigns',
    data: {
      title: `Kampanye Uji ${RUN_TAG}`,
      slug: E2E_CAMPAIGN_SLUG,
      shortDescription: 'Kampanye sementara untuk pengujian E2E',
      description: 'Dibuat dan dihapus otomatis oleh suite E2E.',
      targetAmount: 10_000_000,
      collectedAmount: 0,
      donorCount: 0,
      isActive: true,
      _status: 'published',
    },
    overrideAccess: true,
  })
  return created.id
}

export async function deleteCampaign(): Promise<void> {
  const payload = await getPayload({ config })
  const found = await payload.find({
    collection: 'campaigns',
    where: { slug: { equals: E2E_CAMPAIGN_SLUG } },
    limit: 10,
    overrideAccess: true,
  })
  for (const doc of found.docs) {
    await payload.delete({ collection: 'campaigns', id: doc.id, overrideAccess: true })
  }
}
