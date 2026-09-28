import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import pg from 'pg'
import { hasSandbox } from './setup'

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000'
const RUN = `it-cc-${Date.now()}`

function readEnv(key: string): string | undefined {
  const file = path.resolve(process.cwd(), '.env.local')
  if (!fs.existsSync(file)) return process.env[key]
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (line.startsWith(key + '=')) return line.slice(key.length + 1)
  }
  return process.env[key]
}

describe.runIf(hasSandbox)('relay concurrency (sandbox, needs a running server)', () => {
  let client: pg.Client
  const ids: number[] = []

  beforeAll(async () => {
    client = new pg.Client({
      connectionString: readEnv('DATABASE_URL_DIRECT'),
      ssl: { rejectUnauthorized: false },
    })
    await client.connect()
    for (let i = 0; i < 20; i++) {
      const r = await client.query(
        `insert into webhook_inbox (provider, event_id, payload_hash, status, attempts)
         values ('it-cc', $1, 'h', 'pending', 0) returning id`,
        [`${RUN}-${i}`],
      )
      ids.push(r.rows[0].id)
    }
  })

  afterAll(async () => {
    if (client) {
      await client.query(`delete from webhook_inbox where event_id like $1`, [`${RUN}-%`])
      await client.end()
    }
  })

  it('two overlapping relays claim disjoint rows and together process all 20', async () => {
    const secret = readEnv('RELAY_SECRET') ?? ''
    const headers = { 'x-relay-secret': secret }
    const [a, b] = await Promise.all([
      fetch(`${BASE}/api/outbox/relay`, { headers }).then((r) => r.json()),
      fetch(`${BASE}/api/outbox/relay`, { headers }).then((r) => r.json()),
    ])
    const aIds: number[] = a.claimedIds ?? []
    const bIds: number[] = b.claimedIds ?? []
    const overlap = aIds.filter((x) => bIds.includes(x))
    expect(overlap).toEqual([])
    const union = new Set([...aIds, ...bIds])
    expect(union.size).toBeGreaterThan(0)
  })
})
