export type RateLimitState = {
  count: number
  limit: number
  windowStart: number | null
  now: number
  windowMs: number
}

export type RateLimitDecision = {
  allowed: boolean
  nextCount: number
  resetAt: number
  remaining: number
}

/**
 * Pure rate-limit decision. Given the current window state, decide whether the
 * request is allowed, what the new count should be, and when the window resets.
 * No DB access here so it is fully unit-testable.
 */
export function decideRateLimit(state: RateLimitState): RateLimitDecision {
  const { count, limit, windowStart, now, windowMs } = state

  const windowExpired = windowStart === null || now - windowStart >= windowMs
  const effectiveCount = windowExpired ? 0 : count
  const effectiveStart = windowExpired ? now : (windowStart as number)

  if (limit <= 0) {
    return {
      allowed: false,
      nextCount: effectiveCount,
      resetAt: effectiveStart + windowMs,
      remaining: 0,
    }
  }

  const allowed = effectiveCount < limit
  const nextCount = allowed ? effectiveCount + 1 : effectiveCount
  const remaining = Math.max(0, limit - nextCount)

  return {
    allowed,
    nextCount,
    resetAt: effectiveStart + windowMs,
    remaining,
  }
}

/** Build the DB key + window bucket for a given action and client key. */
export function rateLimitBucket(action: string, clientKey: string): string {
  return `${action}:${clientKey}`
}
