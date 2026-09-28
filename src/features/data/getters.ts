import { unstable_cache } from 'next/cache'
import { REVALIDATE_SECONDS } from './constants'

export { REVALIDATE_SECONDS, PHBI_TAG, PUBLIC_READ } from './constants'

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

