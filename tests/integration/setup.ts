/**
 * Integration-test harness (Plan 6). Fail-closed: if CI runs integration
 * tests without a sandbox database, throw instead of silently skipping.
 *
 * The sandbox is a SEPARATE Supabase project whose direct/session URL is in
 * DATABASE_URL_DIRECT_SANDBOX. We point DATABASE_URL at it BEFORE Payload is
 * imported so the app's getPayload() talks to the sandbox, not production.
 */
import fs from 'node:fs'
import path from 'node:path'

function loadEnvLocal(): void {
  const file = path.resolve(process.cwd(), '.env.local')
  if (!fs.existsSync(file)) return
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!/^[A-Z_]+=/.test(line)) continue
    const i = line.indexOf('=')
    const key = line.slice(0, i)
    if (process.env[key] === undefined) process.env[key] = line.slice(i + 1)
  }
}
loadEnvLocal()

const SANDBOX = process.env.DATABASE_URL_DIRECT_SANDBOX

if (process.env.CI === 'true' && !SANDBOX) {
  throw new Error(
    'FATAL: CI integration run without DATABASE_URL_DIRECT_SANDBOX - refusing to run/skip silently',
  )
}

export const hasSandbox = Boolean(SANDBOX)

if (hasSandbox) {
  process.env.DATABASE_URL = SANDBOX
}
