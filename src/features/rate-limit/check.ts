import { getPayload } from 'payload'
import config from '@payload-config'
import { decideRateLimit, type RateLimitDecision } from './core'

export type RateLimitOptions = {
  key: string
  limit: number
  windowMs: number
  now?: number
}

type RateLimitRow = {
  id: number | string
  key?: string | null
  count?: number | null
  windowStart?: string | null
}

/**
 * DB-backed rate limit (works on serverless where in-process counters do not).
 * Reads the current window row for `key`, decides allow/deny with the pure
 * `decideRateLimit`, then persists the new count.
 */
export async function checkRateLimit(options: RateLimitOptions): Promise<RateLimitDecision> {
  const { key, limit, windowMs, now = Date.now() } = options
  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'rate-limits',
    where: { key: { equals: key } },
    limit: 1,
    overrideAccess: true,
  })
  const row = existing.docs[0] as unknown as RateLimitRow | undefined

  const decision = decideRateLimit({
    count: row?.count ?? 0,
    limit,
    windowStart: row?.windowStart ? new Date(row.windowStart).getTime() : null,
    now,
    windowMs,
  })

  const windowExpired = !row || now - new Date(row.windowStart ?? 0).getTime() >= windowMs
  const windowStart = (windowExpired ? new Date(now) : new Date(row!.windowStart as string)).toISOString()

  if (row) {
    await payload.update({
      collection: 'rate-limits',
      id: row.id,
      data: { count: decision.nextCount, windowStart },
      overrideAccess: true,
    })
  } else {
    await payload.create({
      collection: 'rate-limits',
      data: { key, count: decision.nextCount, windowStart },
      overrideAccess: true,
    })
  }

  return decision
}
