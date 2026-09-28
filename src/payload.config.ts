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
import { Campaign } from './collections/Campaign'
import { Donor } from './collections/Donor'
import { Prayer } from './collections/Prayer'
import { ContactMessage } from './collections/ContactMessage'
import { WebhookInbox } from './collections/WebhookInbox'
import { JobRun } from './collections/JobRun'
import { SiteSettings } from './globals/SiteSettings'

if (process.env.NODE_ENV === 'production' && !process.env.PAYLOAD_SECRET) {
  throw new Error('PAYLOAD_SECRET is required in production')
}

const connectionString = process.env.DATABASE_URL ?? ''
const isPooler = connectionString.includes(':6543')
const isLocalDb = /(localhost|127\.0\.0\.1)/.test(connectionString)

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'CHANGE_ME',
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ...(isPooler ? { prepare: false } : {}),
      ssl: { rejectUnauthorized: false },
    },
    // push stalls ~40s against remote DBs (supabase) on every boot
    push: process.env.NODE_ENV !== 'production' && isLocalDb,
    migrationDir: './src/migrations',
  }),
  collections: [
    Users,
    Media,
    Lembaga,
    Prestasi,
    Fasilitas,
    Publikasi,
    Kajian,
    PhbiRecap,
    SyncRun,
    Campaign,
    Donor,
    Prayer,
    ContactMessage,
    WebhookInbox,
    JobRun,
  ],
  globals: [SiteSettings],
})
