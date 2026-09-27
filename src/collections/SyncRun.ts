import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/rbac'

export const SyncRun: CollectionConfig = {
  slug: 'sync-runs',
  access: {
    read: ({ req }) => isAdmin(req.user),
    create: () => true,
    update: ({ req }) => isAdmin(req.user),
    delete: ({ req }) => isAdmin(req.user),
  },
  fields: [
    { name: 'startedAt', type: 'date' },
    { name: 'finishedAt', type: 'date' },
    { name: 'status', type: 'text' },
    { name: 'rowCount', type: 'number' },
    { name: 'errorMessage', type: 'text' },
  ],
}
