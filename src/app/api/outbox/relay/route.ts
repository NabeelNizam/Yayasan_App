import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (request.headers.get('x-relay-secret') !== process.env.RELAY_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })

    await payload.db.drizzle.transaction(async (tx) => {
      const result = await tx.execute(
        "SELECT id FROM webhook_inbox WHERE status = 'pending' ORDER BY id LIMIT 20 FOR UPDATE SKIP LOCKED",
      )
      const rows = (result as unknown as { rows?: { id: string | number }[] }).rows ?? []
      for (const row of rows) {
        await payload.update({
          collection: 'webhook-inbox',
          id: row.id,
          data: { status: 'done' },
        })
      }
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 })
  }
}
