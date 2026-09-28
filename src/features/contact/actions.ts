'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { contactSchema } from './schema'

export async function submitFeedback(input: unknown): Promise<
  | { ok: true }
  | { ok: false; errors: Record<string, string[] | undefined> }
> {
  const parsed = contactSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors }
  }
  const p = parsed.data
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

  return { ok: true }
}
