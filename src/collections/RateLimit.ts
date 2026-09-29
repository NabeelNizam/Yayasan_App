import type { CollectionConfig } from 'payload'

export const RateLimit: CollectionConfig = {
  slug: 'rate-limits',
  access: {
    read: () => false,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: 'key', type: 'text', required: true, index: true },
    { name: 'count', type: 'number', required: true, defaultValue: 0 },
    { name: 'windowStart', type: 'date', required: true },
  ],
}
