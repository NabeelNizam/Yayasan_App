import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/rbac'
import { readPublished } from '../access/published'
import { toSlug } from '../lib/slug'

export const Lembaga: CollectionConfig = {
  slug: 'lembaga',
  access: {
    read: readPublished,
    create: ({ req }) => isAdminOrEditor(req.user),
    update: ({ req }) => isAdminOrEditor(req.user),
    delete: ({ req }) => isAdminOrEditor(req.user),
  },
  versions: { drafts: true },
  fields: [
    { name: 'nama', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [
          ({ value, siblingData }) => value || toSlug(siblingData?.nama ?? ''),
        ],
      },
    },
    {
      name: 'kategori',
      type: 'select',
      options: [
        { label: 'Pendidikan', value: 'pendidikan' },
        { label: 'Operasional', value: 'operasional' },
      ],
    },
    { name: 'deskripsi', type: 'textarea' },
    { name: 'profilImage', type: 'upload', relationTo: 'media' },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
  ],
}
