import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/rbac'

export const ContactMessage: CollectionConfig = {
  slug: 'contact-messages',
  access: {
    read: ({ req }) => isAdmin(req.user),
    create: () => true,
    update: ({ req }) => isAdmin(req.user),
    delete: ({ req }) => isAdmin(req.user),
  },
  fields: [
    { name: 'name', type: 'text' },
    { name: 'email', type: 'text' },
    { name: 'whatsapp', type: 'text' },
    { name: 'rating', type: 'number' },
    { name: 'message', type: 'textarea' },
    { name: 'isAnonymous', type: 'checkbox', defaultValue: false },
  ],
}
