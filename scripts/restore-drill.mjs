/**
 * Restore drill (Plan 5 Task 2 / Plan 6 Task 5).
 *
 * Dumps the PRODUCTION public schema with pg_dump, restores it into a target
 * (a throwaway/sandbox database) with pg_restore, then asserts row counts for
 * key tables MATCH the source and that payload_migrations is intact.
 *
 * Usage:
 *   SOURCE_URL=postgres://...direct-prod...  TARGET_URL=postgres://...throwaway...  node scripts/restore-drill.mjs
 *
 * Requires pg_dump/pg_restore on PATH. Exits non-zero on any failure so it can
 * gate CI. No secrets are printed.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import pg from 'pg'

const SOURCE = process.env.SOURCE_URL
const TARGET = process.env.TARGET_URL

if (!SOURCE || !TARGET) {
  console.error('restore-drill: SOURCE_URL and TARGET_URL are required')
  process.exit(1)
}
if (SOURCE === TARGET) {
  console.error('restore-drill: SOURCE and TARGET must differ')
  process.exit(1)
}

const KEY_TABLES = ['campaigns', 'donors', 'publikasi', 'kajian', 'payload_migrations']

function countRows(url, table) {
  const client = { connectionString: url, ssl: { rejectUnauthorized: false } }
  return (async () => {
    const c = new pg.Client(client)
    await c.connect()
    try {
      const r = await c.query(`select count(*)::int n from ${table}`)
      return r.rows[0].n
    } finally {
      await c.end()
    }
  })()
}

async function main() {
  const dumpFile = path.join(os.tmpdir(), `yayasan-restore-drill-${Date.now()}.dump`)

  console.log('restore-drill: dumping source (public schema)...')
  execFileSync(
    'pg_dump',
    [
      SOURCE,
      '-Fc',
      '--no-owner',
      '--no-privileges',
      '--schema=public',
      '--exclude-schema=auth',
      '--exclude-schema=storage',
      '--exclude-schema=graphql',
      '-f',
      dumpFile,
    ],
    { stdio: 'inherit' },
  )

  console.log('restore-drill: restoring into target...')
  execFileSync('pg_restore', ['--no-owner', '--no-privileges', '--clean', '--if-exists', '-d', TARGET, dumpFile], {
    stdio: 'inherit',
  })

  console.log('restore-drill: comparing row counts...')
  let failed = false
  for (const table of KEY_TABLES) {
    const [src, dst] = await Promise.all([countRows(SOURCE, table), countRows(TARGET, table)])
    const ok = src === dst
    if (!ok) failed = true
    console.log(`  ${ok ? 'OK ' : 'BAD'} ${table}: source=${src} target=${dst}`)
  }

  fs.rmSync(dumpFile, { force: true })
  if (failed) {
    console.error('restore-drill: FAILED (row counts differ)')
    process.exit(1)
  }
  console.log('restore-drill: PASSED')
}

main().catch((e) => {
  console.error('restore-drill error:', e.message)
  process.exit(1)
})
