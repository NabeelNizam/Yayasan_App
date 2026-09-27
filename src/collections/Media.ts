import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/rbac'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*', 'application/pdf'],
  },
  access: {
    read: () => true,
    create: ({ req }) => isAdminOrEditor(req.user),
    update: ({ req }) => isAdminOrEditor(req.user),
    delete: ({ req }) => isAdminOrEditor(req.user),
  },
  fields: [{ name: 'alt', type: 'text' }],
}
