import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'

/**
 * Direct DB access for E2E verification and cleanup.
 *
 * Reads DATABASE_URL from .env.local (the same connection the app uses) so the
 * tests assert against the real store rather than a mock. Only ever used to
 * SELECT for assertions and DELETE rows that carry our own E2E test marker.
 */

function readDatabaseUrl(): string {
  // Prefer an explicit override, then fall back to .env.local.
  if (process.env.E2E_DATABASE_URL) return process.env.E2E_DATABASE_URL
  const text = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8')
  const line = text.split(/\r?\n/).find((l) => l.startsWith('DATABASE_URL='))
  if (!line) throw new Error('DATABASE_URL not found in .env.local')
  return line
    .slice('DATABASE_URL='.length)
    .trim()
    .replace(/^"|"$/g, '')
}

let pool: Pool | null = null

export function db(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: readDatabaseUrl(),
      ssl: { rejectUnauthorized: false },
      max: 2,
    })
  }
  return pool
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}

/** Unique marker for this run; every row the E2E writes contains it. */
export const RUN_TAG = `E2E-TEST-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export async function countContactMessagesContaining(tag: string): Promise<number> {
  const r = await db().query(
    `select count(*)::int as n from contact_messages where message like $1`,
    [`%${tag}%`]
  )
  return r.rows[0].n as number
}

export async function countDonorsByOrderOrName(tag: string): Promise<number> {
  const r = await db().query(
    `select count(*)::int as n from donors where name like $1`,
    [`%${tag}%`]
  )
  return r.rows[0].n as number
}

export async function donorsForCampaign(slug: string): Promise<
  { name: string; amount: string; is_anonymous: boolean; order_id: string | null }[]
> {
  const r = await db().query(
    `select name, amount, is_anonymous, order_id from donors where campaign_slug = $1 order by id`,
    [slug]
  )
  return r.rows as {
    name: string
    amount: string
    is_anonymous: boolean
    order_id: string | null
  }[]
}

export async function prayersForCampaign(slug: string): Promise<
  { donor_name: string; message: string }[]
> {
  const r = await db().query(
    `select donor_name, message from prayers where campaign_slug = $1 order by id`,
    [slug]
  )
  return r.rows as { donor_name: string; message: string }[]
}

/** Delete every row this run created. Safe: matches only our unique tag. */
export async function cleanupTaggedRows(tag: string): Promise<void> {
  await db().query(`delete from contact_messages where message like $1`, [`%${tag}%`])
  await db().query(`delete from prayers where message like $1 or token like $1`, [`%${tag}%`])
  await db().query(`delete from donors where name like $1`, [`%${tag}%`])
  await db().query(`delete from rate_limits where key like $1`, [`%${tag}%`])
}

/**
 * Clear the feedback rate-limit buckets so a rate-limit test starts from a
 * known state. Without this, one run's leftover counts make the next run's
 * cap assertions non-deterministic.
 */
export async function resetFeedbackBuckets(): Promise<void> {
  await db().query(`delete from rate_limits where key like 'submit-feedback%'`)
}
