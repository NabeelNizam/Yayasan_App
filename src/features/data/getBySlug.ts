import { notFound, unstable_rethrow } from 'next/navigation'

/**
 * Pure, testable lookup: return the item with the given slug, or null.
 */
export function pickOrNull<T extends { slug: string }>(
  items: T[],
  slug: string,
): T | null {
  return items.find((i) => i.slug === slug) ?? null
}

/**
 * Load a list and require a slug to exist. Calls Next's notFound() when the
 * item is missing, so the segment renders not-found.tsx. Any other error is
 * re-thrown (unstable_rethrow guards Next's internal control-flow errors).
 */
export async function requireBySlug<T extends { slug: string }>(
  load: () => Promise<T[]>,
  slug: string,
): Promise<T> {
  try {
    const items = await load()
    const found = pickOrNull(items, slug)
    if (!found) notFound()
    return found as T
  } catch (err) {
    unstable_rethrow(err)
    throw err
  }
}
