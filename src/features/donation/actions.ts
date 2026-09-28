'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { donationSchema } from './schema'
import { ManualPaymentProvider } from './provider'
import { isUniqueViolation } from './errors'

const provider = new ManualPaymentProvider()

type DonorDoc = { id: number | string; orderId?: string | null }

export async function submitDonation(input: unknown): Promise<
  | { ok: true; orderId?: string | null; deduped?: boolean }
  | { ok: false; errors: Record<string, string[] | undefined> }
> {
  const parsed = donationSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors }
  }
  const p = parsed.data
  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'donors',
    where: { clientToken: { equals: p.clientToken } },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs.length > 0) {
    const doc = existing.docs[0] as unknown as DonorDoc
    return { ok: true, orderId: doc.orderId, deduped: true }
  }

  const { orderId } = await provider.createTransaction({
    campaignSlug: p.campaignSlug,
    amount: p.amount,
    donorName: p.donorName,
    anonymous: p.anonymous,
  })

  const transactionID = await payload.db.beginTransaction()
  if (!transactionID) throw new Error('DB tidak mendukung transaksi')

  try {
    await payload.create({
      collection: 'donors',
      req: { transactionID },
      data: {
        campaignSlug: p.campaignSlug,
        clientToken: p.clientToken,
        name: p.anonymous ? 'Hamba Allah' : p.donorName,
        amount: p.amount,
        isAnonymous: p.anonymous,
        orderId,
        isPublic: false,
      },
    })
    if (p.prayer) {
      await payload.create({
        collection: 'prayers',
        req: { transactionID },
        data: {
          token: p.clientToken,
          campaignSlug: p.campaignSlug,
          donorName: p.anonymous ? 'Hamba Allah' : p.donorName,
          isAnonymous: p.anonymous,
          message: p.prayer,
        },
      })
    }
    await payload.db.commitTransaction(transactionID)
  } catch (err) {
    await payload.db.rollbackTransaction(transactionID)
    if (isUniqueViolation(err)) {
      const again = await payload.find({
        collection: 'donors',
        where: { clientToken: { equals: p.clientToken } },
        limit: 1,
        overrideAccess: true,
      })
      const doc = again.docs[0] as unknown as DonorDoc | undefined
      return { ok: true, orderId: doc?.orderId ?? orderId, deduped: true }
    }
    throw err
  }

  return { ok: true, orderId }
}
