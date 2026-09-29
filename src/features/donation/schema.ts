import { z } from 'zod'

export const DONATION_LIMITS = { MIN: 10000, MAX: 1000000 } as const

const wa = /^(\+62|62|0)[0-9]{9,12}$/

export const donationSchema = z
  .object({
    campaignSlug: z.string().min(1),
    clientToken: z.string().min(8),
    donorName: z.string(),
    anonymous: z.boolean(),
    whatsapp: z.string().regex(wa, 'Format nomor WhatsApp tidak valid'),
    email: z.union([z.string().email(), z.literal('')]).optional(),
    amount: z.number().int().min(DONATION_LIMITS.MIN).max(DONATION_LIMITS.MAX),
    prayer: z.string().max(500).optional(),
  })
  .superRefine((val, ctx) => {
    // An anonymous donation has no name field to fill, so the name is only
    // required (and length-checked) for named donations.
    if (!val.anonymous && val.donorName.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['donorName'],
        message: 'Nama minimal 3 karakter',
      })
    }
  })

export type DonationInput = z.infer<typeof donationSchema>
