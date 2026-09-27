import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/rbac'
import { readPublished } from '../access/published'
import { toSlug } from '../lib/slug'

export const Publikasi: CollectionConfig = {
  slug: 'publikasi',
  access: {
    read: readPublished,
    create: ({ req }) => isAdminOrEditor(req.user),
    update: ({ req }) => isAdminOrEditor(req.user),
    delete: ({ req }) => isAdminOrEditor(req.user),
  },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'date', type: 'date', required: true },
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
    { name: 'image', type: 'upload', relationTo: 'media' },
  ],
}
