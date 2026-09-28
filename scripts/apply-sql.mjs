import fs from 'node:fs'
import pg from 'pg'

const MIGRATION_NAME = '20260928_094827'

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

const before = await client.query(
  "select count(*)::int n from information_schema.tables where table_schema='public'",
)
console.log('tables before:', before.rows[0].n)

if (before.rows[0].n > 0) {
  console.log('schema already present - aborting to avoid clobbering')
  await client.end()
  process.exit(0)
}

try {
  await client.query('BEGIN')
  await client.query(sqlText)
  await client.query(
    'insert into payload_migrations (name, batch) values ($1, 1)',
    [MIGRATION_NAME],
  )
  await client.query('COMMIT')
  console.log('applied migration + recorded in payload_migrations')
} catch (e) {
  await client.query('ROLLBACK').catch(() => {})
  console.error('APPLY FAILED:', e.message)
  await client.end()
  process.exit(1)
}

const after = await client.query(
  "select count(*)::int n from information_schema.tables where table_schema='public'",
)
const ledger = await client.query('select name, batch from payload_migrations order by batch')
console.log('tables after:', after.rows[0].n)
console.log('ledger:', ledger.rows.map((r) => `${r.name}(batch ${r.batch})`).join(', '))

await client.end()
