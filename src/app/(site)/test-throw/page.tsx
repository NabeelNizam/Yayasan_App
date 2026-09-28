export const dynamic = 'force-dynamic'

/**
 * Test-only route (Plan 2 Task 7). Throws on demand via `?throw=1` so the
 * behaviour is runtime-controlled (an env var would be inlined at build).
 * Returns 404 otherwise so it is inert in normal operation.
 */
export default async function ThrowPage({
  searchParams,
}: {
  searchParams: Promise<{ throw?: string }>
}) {
  const { throw: shouldThrow } = await searchParams
  if (shouldThrow === '1') {
    throw new Error('intentional test error')
  }
  return <div>ok</div>
}