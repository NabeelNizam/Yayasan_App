import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

import { Users } from './collections/Users'
import { Media } from './collections/Media'

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'CHANGE_ME',
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
      max: 3,
    },
    push: process.env.NODE_ENV !== 'production',
    migrationDir: './src/migrations',
  }),
  collections: [Users, Media],
})
