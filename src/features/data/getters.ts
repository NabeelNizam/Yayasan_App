import { unstable_cache } from 'next/cache'

/** ISR window for public reads (Plan 2 Task 3). */
export const REVALIDATE_SECONDS = 300

/** Cache tag invalidated by the PHBI sync (revalidateTag('phbi')). */
export const PHBI_TAG = 'phbi'

/**
 * Public reads MUST run with access control on, so published/draft
 * filtering and PII rules are enforced by Payload (never bypassed).
 */
export const PUBLIC_READ = { overrideAccess: false as const }

/**
 * Wrap a data loader in Next's cache with a shared revalidate window and
 * tags, so a successful sync can invalidate it via revalidateTag.
 */
export function tagged<TArgs extends unknown[], TResult>(
  keyParts: string[],
  tags: string[],
  fn: (...args: TArgs) => Promise<TResult>,
) {
  return unstable_cache(fn, keyParts, {
    revalidate: REVALIDATE_SECONDS,
    tags,
  })
}
