import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/rbac'

export const JobRun: CollectionConfig = {
  slug: 'job-runs',
  access: {
    read: ({ req }) => isAdmin(req.user),
    create: ({ req }) => isAdmin(req.user),
    update: ({ req }) => isAdmin(req.user),
    delete: ({ req }) => isAdmin(req.user),
  },
  fields: [
    { name: 'name', type: 'text', required: true, index: true },
    { name: 'lastSuccessAt', type: 'date' },
  ],
}
