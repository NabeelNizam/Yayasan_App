import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sql } from '@payloadcms/db-postgres'

export const dynamic = 'force-dynamic'

type TxDb = {
  beginTransaction: () => Promise<number | string | null>
  commitTransaction: (id: number | string) => Promise<void>
  rollbackTransaction: (id: number | string) => Promise<void>
  sessions: Record<string, { db: { execute: (q: unknown) => Promise<unknown> } }>
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function GET(request: NextRequest) {
  if (request.headers.get('x-relay-secret') !== process.env.RELAY_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  // test-only hooks (never set in production)
  const testDelayMs = Number(process.env.RELAY_TEST_DELAY_MS ?? 0)
  const disableSkipLocked = process.env.RELAY_DISABLE_SKIP_LOCKED === '1'

  try {
    const payload = await getPayload({ config })
    const db = payload.db as unknown as TxDb

    const transactionID = await db.beginTransaction()
    if (!transactionID) {
      return NextResponse.json({ ok: false }, { status: 503 })
    }

    let claimedIds: (string | number)[] = []
    try {
      const txDrizzle = db.sessions[String(transactionID)].db
      const lockClause = disableSkipLocked ? '' : ' FOR UPDATE SKIP LOCKED'
      const result = (await txDrizzle.execute(
        sql.raw(
          `SELECT id FROM webhook_inbox WHERE status = 'pending' ORDER BY id LIMIT 20${lockClause}`,
        ),
      )) as { rows?: { id: string | number }[] }
      const rows = result.rows ?? []

      if (testDelayMs > 0) await sleep(testDelayMs)

      for (const row of rows) {
        await payload.update({
          collection: 'webhook-inbox',
          id: row.id,
          data: { status: 'done' },
          req: { transactionID },
        })
        claimedIds.push(row.id)
      }

      await db.commitTransaction(transactionID)
    } catch (err) {
      await db.rollbackTransaction(transactionID)
      throw err
    }

    return NextResponse.json({ ok: true, claimed: claimedIds.length, claimedIds })
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 })
  }
}
