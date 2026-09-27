import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor } from '../access/rbac'
import { readPublicDonors } from '../access/published'

export const Donor: CollectionConfig = {
  slug: 'donors',
  access: {
    read: readPublicDonors,
    create: () => true,
    update: ({ req }) => isAdminOrEditor(req.user),
    delete: ({ req }) => isAdminOrEditor(req.user),
  },
  fields: [
    { name: 'campaignSlug', type: 'text', required: true },
    { name: 'clientToken', type: 'text', required: true, unique: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'amount', type: 'number', required: true },
    { name: 'isAnonymous', type: 'checkbox', defaultValue: false },
    { name: 'orderId', type: 'text', access: { read: ({ req }) => isAdmin(req.user) } },
    { name: 'isPublic', type: 'checkbox', defaultValue: false },
  ],
}
