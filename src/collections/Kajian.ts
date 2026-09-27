import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/rbac'
import { readPublished } from '../access/published'
import { toSlug } from '../lib/slug'
import { validateKajian, type KajianInput } from '../features/kajian/validate'

export const Kajian: CollectionConfig = {
  slug: 'kajian',
  access: {
    read: readPublished,
    create: ({ req }) => isAdminOrEditor(req.user),
    update: ({ req }) => isAdminOrEditor(req.user),
    delete: ({ req }) => isAdminOrEditor(req.user),
  },
  versions: { drafts: true },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'artikel',
      options: [
        { label: 'Video', value: 'video' },
        { label: 'Artikel', value: 'artikel' },
        { label: 'Kitab', value: 'kitab' },
      ],
    },
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
    { name: 'youtubeId', type: 'text', admin: { condition: (data) => data?.type === 'video' } },
    {
      name: 'body',
      type: 'richText',
      admin: { condition: (data) => data?.type === 'artikel' },
    },
    {
      name: 'pdf',
      type: 'upload',
      relationTo: 'media',
      admin: { condition: (data) => data?.type === 'kitab' },
    },
    { name: 'publishedAt', type: 'date' },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data
        const result = validateKajian({
          type: data.type,
          youtubeId: data.youtubeId,
          body: data.body ? 'set' : undefined,
          pdfId: data.pdf,
        } as KajianInput)
        if (!result.ok) {
          throw new Error(result.error)
        }
        return data
      },
    ],
  },
}
