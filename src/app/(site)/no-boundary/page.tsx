export const dynamic = 'force-dynamic'

/**
 * Test-only route (Plan 2 Task 7). Throws on demand via `?throw=1` and has
 * NO error.tsx of its own, so the error bubbles up (unbounded path).
 */
export default async function NoBoundaryPage({
  searchParams,
}: {
  searchParams: Promise<{ throw?: string }>
}) {
  const { throw: shouldThrow } = await searchParams
  if (shouldThrow === '1') {
    throw new Error('intentional test error (unbounded)')
  }
  return <div>ok</div>
}