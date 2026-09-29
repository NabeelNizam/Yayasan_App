import fs from 'fs'
import path from 'path'
import { Client } from 'pg'

/**
 * Admin-user seeding for the Payload /admin login test.
 *
 * Payload stores auth users with a hashed password and a salt. Rather than
 * re-implement Payload's hashing, we create the user through Payload's own
 * Local API (`getPayload`) so the credential format is always correct, then
 * delete it in teardown. The DB is left exactly as we found it.
 */

export const E2E_ADMIN_EMAIL = 'e2e-admin@test.local'
export const E2E_ADMIN_PASSWORD = `E2e_${Math.random().toString(36).slice(2)}_Aa1!`

function readEnv(key: string): string | undefined {
  if (process.env[key]) return process.env[key]
  const text = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8')
  const line = text.split(/\r?\n/).find((l) => l.startsWith(`${key}=`))
  return line?.slice(key.length + 1).trim().replace(/^"|"$/g, '')
}

/**
 * Create (or reset) the E2E admin user via the Payload Local API and return
 * its id. Uses a tiny inline script executed through tsx-less dynamic import
 * of the compiled Payload config path is not possible here, so we go straight
 * to the DB with Payload's crypto helpers.
 */
export async function seedAdminUser(): Promise<number | string> {
  const { getPayload } = await import('payload')
  const config = (await import('@payload-config')).default
  const payload = await getPayload({ config })

  // Remove a stale E2E admin if a previous run crashed mid-way.
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: E2E_ADMIN_EMAIL } },
    limit: 1,
    overrideAccess: true,
  })
  for (const doc of existing.docs) {
    await payload.delete({ collection: 'users', id: doc.id, overrideAccess: true })
  }

  const created = await payload.create({
    collection: 'users',
    data: { email: E2E_ADMIN_EMAIL, password: E2E_ADMIN_PASSWORD, role: 'admin' },
    overrideAccess: true,
  })
  return created.id
}

export async function deleteAdminUser(): Promise<void> {
  const { getPayload } = await import('payload')
  const config = (await import('@payload-config')).default
  const payload = await getPayload({ config })
  const found = await payload.find({
    collection: 'users',
    where: { email: { equals: E2E_ADMIN_EMAIL } },
    limit: 10,
    overrideAccess: true,
  })
  for (const doc of found.docs) {
    await payload.delete({ collection: 'users', id: doc.id, overrideAccess: true })
  }
}

/** Assert no leftover E2E users remain (used as a teardown guard). */
export async function countE2eAdminUsers(): Promise<number> {
  const url = readEnv('DATABASE_URL')
  if (!url) throw new Error('DATABASE_URL missing')
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
  await c.connect()
  try {
    const r = await c.query('select count(*)::int as n from users where email = $1', [
      E2E_ADMIN_EMAIL,
    ])
    return r.rows[0].n as number
  } finally {
    await c.end()
  }
}
