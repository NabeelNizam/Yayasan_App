import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/rbac'
import { canReadUsers, canSetRole, canUpdateUser } from '../access/users'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  access: {
    create: ({ req }) => isAdmin(req.user),
    update: ({ req, id }) => canUpdateUser(req.user, id as number | string),
    delete: ({ req }) => isAdmin(req.user),
    read: ({ req, id }) => canReadUsers(req.user, id as number | string | undefined),
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
      access: {
        create: ({ req }) => isAdmin(req.user),
        update: ({ req }) => canSetRole(req.user),
      },
    },
  ],
}