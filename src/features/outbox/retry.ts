export const MAX_ATTEMPTS = 5

const BASE_MS = 30_000
const CAP_MS = 60 * 60 * 1000

/** Exponential backoff, capped at 1 hour. attempts is 1-based. */
export function backoffMs(attempts: number): number {
  const exp = Math.max(0, attempts - 1)
  return Math.min(CAP_MS, BASE_MS * 2 ** exp)
}

export type Outcome = {
  status: 'done' | 'pending' | 'dead'
  attempts: number
  retryAt: Date | null
}

/**
 * Decide the next state of a webhook row after a processing attempt.
 * Success -> done. Failure -> pending with backoff until MAX_ATTEMPTS -> dead.
 */
export function decideOutcome(args: {
  ok: boolean
  attempts: number
  now?: number
  maxAttempts?: number
}): Outcome {
  const { ok, attempts } = args
  const now = args.now ?? Date.now()
  const max = args.maxAttempts ?? MAX_ATTEMPTS

  if (ok) {
    return { status: 'done', attempts, retryAt: null }
  }

  const nextAttempts = attempts + 1
  if (nextAttempts >= max) {
    return { status: 'dead', attempts: nextAttempts, retryAt: null }
  }

  return {
    status: 'pending',
    attempts: nextAttempts,
    retryAt: new Date(now + backoffMs(nextAttempts)),
  }
}
