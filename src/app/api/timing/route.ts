import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

type PoolLike = { totalCount: number; idleCount: number; waitingCount: number }

function poolStats(pool: PoolLike | undefined) {
  if (!pool) return null
  return { total: pool.totalCount, idle: pool.idleCount, waiting: pool.waitingCount }
}

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return new Response('Not found', { status: 404 })
  }

  const t0 = Date.now()
  const payload = await getPayload({ config })
  const t1 = Date.now()
  const settings = await payload.findGlobal({ slug: 'site-settings', overrideAccess: false })
  const t2 = Date.now()

  return Response.json({
    initMs: t1 - t0,
    queryMs: t2 - t1,
    totalMs: t2 - t0,
    keys: Object.keys(settings ?? {}).length,
    pool: poolStats((payload.db as unknown as { pool?: PoolLike }).pool),
  })
}
