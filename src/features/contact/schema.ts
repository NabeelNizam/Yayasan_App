import { z } from 'zod'

export const contactSchema = z.object({
  rating: z.number().int().min(1).max(5),
  message: z.string().min(1).max(2000),
  name: z.string().max(200).optional(),
  email: z.union([z.string().email(), z.literal('')]).optional(),
  whatsapp: z.string().max(30).optional(),
  isAnonymous: z.boolean().optional(),
  honeypot: z.string().max(0, 'Spam terdeteksi'),
})

export type ContactInput = z.infer<typeof contactSchema>
