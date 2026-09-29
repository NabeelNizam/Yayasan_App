import fs from 'fs'
import path from 'path'
import { request } from '@playwright/test'

/**
 * Playwright runs in its own Node process, so the app's .env.local is not
 * loaded automatically the way Next.js does it. Payload's Local API (used by
 * the E2E seed/teardown helpers) needs DATABASE_URL, so load it here before
 * anything imports @payload-config.
 *
 * It also warms the server: the health endpoint answers before the app routes
 * are compiled, so the first page hit after startup can briefly fail to serve
 * its chunks. Hitting each route once here keeps that race out of the tests.
 */

const WARM_ROUTES = [
  '/',
  '/tentang-kami',
  '/kegiatan',
  '/kegiatan/tk',
  '/kegiatan/takmir',
  '/publikasi',
  '/donasi',
  '/kontak',
]

export default async function globalSetup(): Promise<void> {
  loadEnv()

  const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
  const ctx = await request.newContext({ baseURL })
  try {
    for (const route of WARM_ROUTES) {
      await ctx.get(route, { timeout: 60_000 }).catch(() => undefined)
    }
  } finally {
    await ctx.dispose()
  }
}

function loadEnv(): void {
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
