import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sql } from '@payloadcms/db-postgres'
import { defaultWebhookHandler, getWebhookHandler } from '@/features/outbox/handlers'
import { decideOutcome } from '@/features/outbox/retry'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

type TxDb = {
  beginTransaction: () => Promise<number | string | null>
  commitTransaction: (id: number | string) => Promise<void>
  rollbackTransaction: (id: number | string) => Promise<void>
  sessions: Record<string, { db: { execute: (q: unknown) => Promise<unknown> } }>
}

type InboxRow = {
  id: number | string
  provider: string
  event_id: string
  payload: unknown
  attempts: number | null
}

const BATCH = 20
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function GET(request: NextRequest) {
  return handleRelay(request)
}

export async function POST(request: NextRequest) {
  return handleRelay(request)
}

async function handleRelay(request: NextRequest): Promise<NextResponse> {
  const secret = request.headers.get('x-relay-secret')
  if (!secret || secret !== process.env.RELAY_SECRET) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const testDelayMs = Number(process.env.RELAY_TEST_DELAY_MS ?? 0)
  const disableSkipLocked = process.env.RELAY_DISABLE_SKIP_LOCKED === '1'

  let payload: Awaited<ReturnType<typeof getPayload>>
  try {
    payload = await getPayload({ config })
  } catch (err) {
    console.error('[relay] cannot init payload', err)
    return NextResponse.json({ ok: false, error: 'db-unavailable' }, { status: 503 })
  }

  const db = payload.db as unknown as TxDb
  const transactionID = await db.beginTransaction()
  if (!transactionID) {
    return NextResponse.json({ ok: false, error: 'no-transaction' }, { status: 503 })
  }

  const claimedIds: (string | number)[] = []
  let processed = 0
  let failed = 0

  try {
    const txDrizzle = db.sessions[String(transactionID)].db
    const lockClause = disableSkipLocked ? '' : ' FOR UPDATE SKIP LOCKED'
    const result = (await txDrizzle.execute(
      sql.raw(
        `SELECT id, provider, event_id, payload, attempts FROM webhook_inbox
         WHERE status = 'pending' AND (next_attempt_at IS NULL OR next_attempt_at <= now())
         ORDER BY id LIMIT ${BATCH}${lockClause}`,
      ),
    )) as { rows?: InboxRow[] }
    const rows = result.rows ?? []

    if (testDelayMs > 0) await sleep(testDelayMs)

    for (const row of rows) {
      const handler = getWebhookHandler(row.provider) ?? defaultWebhookHandler
      let ok = true
      try {
        await handler({ provider: row.provider, eventId: row.event_id, payload: row.payload })
      } catch (err) {
        ok = false
        console.error(`[relay] handler failed for inbox ${row.id} (${row.provider})`, err)
      }

      const outcome = decideOutcome({ ok, attempts: row.attempts ?? 0 })
      await payload.update({
        collection: 'webhook-inbox',
        id: row.id,
        data: {
          status: outcome.status,
          attempts: outcome.attempts,
          nextAttemptAt: outcome.retryAt ? outcome.retryAt.toISOString() : null,
        },
        req: { transactionID },
      })

      claimedIds.push(row.id)
      if (ok) processed++
      else failed++
    }

    await db.commitTransaction(transactionID)
  } catch (err) {
    await db.rollbackTransaction(transactionID)
    console.error('[relay] transaction failed', err)
    return NextResponse.json({ ok: false, error: 'relay-failed' }, { status: 503 })
  }

  return NextResponse.json({ ok: true, claimed: claimedIds.length, processed, failed, claimedIds })
}
