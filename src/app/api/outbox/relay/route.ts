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

export async function GET(request: NextRequest) {
  if (request.headers.get('x-relay-secret') !== process.env.RELAY_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const db = payload.db as unknown as TxDb

    const transactionID = await db.beginTransaction()
    if (!transactionID) {
      return NextResponse.json({ ok: false }, { status: 503 })
    }

    let claimed = 0
    try {
      const txDrizzle = db.sessions[String(transactionID)].db
      const result = (await txDrizzle.execute(
        sql`SELECT id FROM webhook_inbox WHERE status = 'pending' ORDER BY id LIMIT 20 FOR UPDATE SKIP LOCKED`,
      )) as { rows?: { id: string | number }[] }
      const rows = result.rows ?? []

      for (const row of rows) {
        await payload.update({
          collection: 'webhook-inbox',
          id: row.id,
          data: { status: 'done' },
          req: { transactionID },
        })
        claimed++
      }

      await db.commitTransaction(transactionID)
    } catch (err) {
      await db.rollbackTransaction(transactionID)
      throw err
    }

    return NextResponse.json({ ok: true, claimed })
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 })
  }
}