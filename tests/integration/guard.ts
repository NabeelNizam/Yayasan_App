/**
 * Guard: refuse to run integration tests against PRODUCTION.
 *
 * Blocks only when a *distinct* sandbox is configured that resolves to the
 * SAME project ref as production (misconfiguration). If no prod ref is set,
 * or the sandbox equals prod intentionally during local-only runs, the
 * onus is on the caller; in CI the setup file is fail-closed.
 */
export function assertNotProd(): void {
  const prod = process.env.DATABASE_URL_DIRECT ?? ''
  const sandbox = process.env.DATABASE_URL_DIRECT_SANDBOX ?? ''
  const refOf = (u: string): string =>
    u.match(/db\.([a-z0-9]+)\./) ?.[1] ??
    u.match(/postgres\.([a-z0-9]+):/) ?.[1] ??
    ''
  const prodRef = refOf(prod)
  const sandboxRef = refOf(sandbox)
  const sandboxIsDistinct = Boolean(sandbox) && sandbox !== prod
  if (sandboxIsDistinct && prodRef && prodRef === sandboxRef) {
    throw new Error('sandbox ref == prod ref - integration run aborted')
  }
}
