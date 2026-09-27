import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access/rbac'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
    update: ({ req }) => isAdminOrEditor(req.user),
  },
  fields: [
    {
      name: 'tentangKami',
      type: 'group',
      fields: [
        { name: 'visi', type: 'textarea' },
        { name: 'misi', type: 'array', fields: [{ name: 'teks', type: 'text' }] },
        { name: 'detail', type: 'textarea' },
      ],
    },
    {
      name: 'kontak',
      type: 'group',
      fields: [
        { name: 'email', type: 'text' },
        { name: 'phone', type: 'text' },
        { name: 'address', type: 'textarea' },
        { name: 'mapEmbedUrl', type: 'text' },
        { name: 'hours', type: 'text' },
      ],
    },
    {
      name: 'sosial',
      type: 'array',
      fields: [
        { name: 'platform', type: 'text' },
        { name: 'url', type: 'text' },
      ],
    },
    {
      name: 'sheetMapping',
      type: 'group',
      fields: [
        { name: 'eventColumn', type: 'text' },
        { name: 'yearColumn', type: 'text' },
        { name: 'dateColumn', type: 'text' },
      ],
    },
  ],
}
