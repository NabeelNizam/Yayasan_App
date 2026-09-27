import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/rbac'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  access: {
    create: ({ req }) => isAdmin(req.user),
    update: ({ req, id }) => isAdmin(req.user) || req.user?.id === id,
    delete: ({ req }) => isAdmin(req.user),
    read: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
    },
  ],
}
