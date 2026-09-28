import fs from 'node:fs'
import pg from 'pg'

const env = Object.fromEntries(
  fs
    .readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i), l.slice(i + 1)]
    }),
)

const sqlText = fs.readFileSync('docs/sql/01-init-schema.sql', 'utf8')

const client = new pg.Client({
  connectionString: env.DATABASE_URL_DIRECT,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 20000,
})

await client.connect()
console.log('connected; validating full schema inside a ROLLBACK transaction...')

try {
  await client.query('BEGIN')
  await client.query(sqlText)
  const t = await client.query(
    "select count(*)::int n from information_schema.tables where table_schema='public'",
  )
  const idx = await client.query(
    "select indexname from pg_indexes where schemaname='public' and indexname like '%client_token%'",
  )
  console.log('VALIDATION OK')
  console.log('  tables created in txn:', t.rows[0].n)
  console.log('  unique index found:', idx.rows.map((r) => r.indexname).join(', ') || '(none)')
  await client.query('ROLLBACK')
  console.log('rolled back - Supabase unchanged')
} catch (e) {
  await client.query('ROLLBACK').catch(() => {})
  console.error('VALIDATION FAILED:', e.message)
  process.exitCode = 1
} finally {
  await client.end()
}
