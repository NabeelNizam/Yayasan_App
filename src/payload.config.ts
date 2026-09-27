import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Lembaga } from './collections/Lembaga'
import { Prestasi } from './collections/Prestasi'
import { Fasilitas } from './collections/Fasilitas'
import { Publikasi } from './collections/Publikasi'
import { Kajian } from './collections/Kajian'
import { PhbiRecap } from './collections/PhbiRecap'
import { SyncRun } from './collections/SyncRun'

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
  collections: [Users, Media, Lembaga, Prestasi, Fasilitas, Publikasi, Kajian, PhbiRecap, SyncRun],
})
