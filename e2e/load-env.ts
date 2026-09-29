import fs from 'fs'
import path from 'path'

/**
 * Playwright runs in its own Node process, so the app's .env.local is not
 * loaded automatically the way Next.js does it. Payload's Local API (used by
 * the E2E seed/teardown helpers) needs DATABASE_URL, so load it here before
 * anything imports @payload-config.
 */
export default function loadEnv(): void {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!match) continue
    const [, key, raw] = match
    if (process.env[key] === undefined) {
      process.env[key] = raw.trim().replace(/^"|"$/g, '')
    }
  }
}
