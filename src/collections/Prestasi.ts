import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/rbac'
import { readPublished } from '../access/published'

export const Prestasi: CollectionConfig = {
  slug: 'prestasi',
  access: {
    read: readPublished,
    create: ({ req }) => isAdminOrEditor(req.user),
    update: ({ req }) => isAdminOrEditor(req.user),
    delete: ({ req }) => isAdminOrEditor(req.user),
  },
  versions: { drafts: true },
  fields: [
    { name: 'lembaga', type: 'relationship', relationTo: 'lembaga', required: true },
    { name: 'title', type: 'text', required: true },
    { name: 'event', type: 'text' },
    { name: 'date', type: 'date' },
  ],
}
