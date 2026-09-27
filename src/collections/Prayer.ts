import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/rbac'
import { readPublicNoDraft } from '../access/published'

export const Prayer: CollectionConfig = {
  slug: 'prayers',
  access: {
    read: readPublicNoDraft,
    create: () => true,
    update: ({ req }) => isAdminOrEditor(req.user),
    delete: ({ req }) => isAdminOrEditor(req.user),
  },
  fields: [
    { name: 'token', type: 'text', required: true, unique: true, index: true },
    { name: 'campaignSlug', type: 'text' },
    { name: 'donorName', type: 'text' },
    { name: 'isAnonymous', type: 'checkbox', defaultValue: false },
    { name: 'message', type: 'textarea' },
  ],
}
