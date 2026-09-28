import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

function poolStats(pool: any) {
  if (!pool) return null
  return {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  }
}

export async function GET() {
  const t0 = Date.now()
  console.log('[TIMING] start getPayload', t0)
  const payload = await getPayload({ config })
  const t1 = Date.now()
  console.log('[TIMING] getPayload done in', t1 - t0, 'ms; pool=', JSON.stringify(poolStats((payload.db as any).pool)))
  const settings = await payload.findGlobal({ slug: 'site-settings', overrideAccess: false })
  const t2 = Date.now()
  console.log('[TIMING] findGlobal done in', t2 - t1, 'ms; pool=', JSON.stringify(poolStats((payload.db as any).pool)))

  return Response.json({
    initMs: t1 - t0,
    queryMs: t2 - t1,
    totalMs: t2 - t0,
    keys: Object.keys(settings ?? {}).length,
    pool: poolStats((payload.db as any).pool),
  })
}
