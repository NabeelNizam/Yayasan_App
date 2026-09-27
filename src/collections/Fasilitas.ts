import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/rbac'
import { readPublished } from '../access/published'

export const Fasilitas: CollectionConfig = {
  slug: 'fasilitas',
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
    { name: 'desc', type: 'text' },
    { name: 'icon', type: 'text' },
  ],
}
