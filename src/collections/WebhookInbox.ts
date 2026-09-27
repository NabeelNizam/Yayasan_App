import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/rbac'

export const WebhookInbox: CollectionConfig = {
  slug: 'webhook-inbox',
  access: {
    read: ({ req }) => isAdmin(req.user),
    create: () => true,
    update: ({ req }) => isAdmin(req.user),
    delete: ({ req }) => isAdmin(req.user),
  },
  fields: [
    { name: 'provider', type: 'text', required: true },
    { name: 'eventId', type: 'text', required: true, index: true },
    { name: 'payloadHash', type: 'text' },
    { name: 'payload', type: 'json' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Done', value: 'done' },
        { label: 'Dead', value: 'dead' },
      ],
      index: true,
    },
    { name: 'attempts', type: 'number', defaultValue: 0 },
    { name: 'nextAttemptAt', type: 'date' },
  ],
}
