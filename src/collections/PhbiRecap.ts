import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/rbac'
import { readPublicNoDraft } from '../access/published'

export const PhbiRecap: CollectionConfig = {
  slug: 'phbi-recap',
  access: {
    read: readPublicNoDraft,
    create: ({ req }) => isAdminOrEditor(req.user),
    update: ({ req }) => isAdminOrEditor(req.user),
    delete: ({ req }) => isAdminOrEditor(req.user),
  },
  fields: [
    { name: 'rowKey', type: 'text', required: true, unique: true, index: true },
    { name: 'event', type: 'text', required: true },
    { name: 'year', type: 'text' },
    { name: 'date', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'image_url', type: 'text' },
  ],
}
