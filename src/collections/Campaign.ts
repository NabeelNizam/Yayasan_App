import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/rbac'
import { readPublished } from '../access/published'
import { toSlug } from '../lib/slug'

export const Campaign: CollectionConfig = {
  slug: 'campaigns',
  access: {
    read: readPublished,
    create: ({ req }) => isAdminOrEditor(req.user),
    update: ({ req }) => isAdminOrEditor(req.user),
    delete: ({ req }) => isAdminOrEditor(req.user),
  },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [
          ({ value, siblingData }) => value || toSlug(siblingData?.title ?? ''),
        ],
      },
    },
    { name: 'shortDescription', type: 'textarea' },
    { name: 'description', type: 'textarea' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'targetAmount', type: 'number', defaultValue: 0 },
    { name: 'collectedAmount', type: 'number', defaultValue: 0 },
    { name: 'donorCount', type: 'number', defaultValue: 0 },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
  ],
}
