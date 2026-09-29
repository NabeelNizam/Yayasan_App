'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { contactSchema } from './schema'
import { checkRateLimit } from '@/features/rate-limit/check'
import { clientKeyFromHeaders } from '@/features/rate-limit/clientKey'
import { rateLimitBucket } from '@/features/rate-limit/core'

const FEEDBACK_LIMIT = 5
const FEEDBACK_WINDOW_MS = 60_000

export async function submitFeedback(input: unknown): Promise<
  | { ok: true }
  | { ok: false; errors: Record<string, string[] | undefined> }
> {
  const parsed = contactSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors }
  }
  const p = parsed.data

  const h = await headers()
  const clientKey = clientKeyFromHeaders(Object.fromEntries(h.entries()))
  const limit = await checkRateLimit({
    key: rateLimitBucket('submit-feedback', clientKey),
    limit: FEEDBACK_LIMIT,
    windowMs: FEEDBACK_WINDOW_MS,
  })
  if (!limit.allowed) {
    return { ok: false, errors: { message: ['Terlalu banyak pengiriman. Coba lagi nanti.'] } }
  }

  const payload = await getPayload({ config })

  await payload.create({
    collection: 'contact-messages',
    data: {
      name: p.isAnonymous ? '' : (p.name ?? ''),
      email: p.email ?? '',
      whatsapp: p.whatsapp ?? '',
      rating: p.rating,
      message: p.message,
      isAnonymous: p.isAnonymous ?? false,
    },
  })

  revalidatePath('/kontak')
  return { ok: true }
}
