import { Pool } from 'pg'

export const dynamic = 'force-dynamic'

let pool: Pool | undefined

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    })
  }
  return pool
}

export async function GET() {
  let client
  try {
    client = await getPool().connect()
    await client.query('SELECT 1')
    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false }, { status: 503 })
  } finally {
    client?.release()
  }
}
