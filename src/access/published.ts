import type { Access } from 'payload'

export const readPublished: Access = ({ req: { user } }) =>
  user ? true : { _status: { equals: 'published' } }

export const readPublicNoDraft: Access = () => true

export const readPublicDonors: Access = () => ({ isPublic: { equals: true } })
