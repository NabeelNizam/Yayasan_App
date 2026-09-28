import { execSync } from 'node:child_process'
import process from 'node:process'

// Migrations must run on a direct/session connection (5432), never the
// transaction pooler (6543). On IPv6-only networks the Supabase "direct"
// host is unreachable, so fall back to the session pooler explicitly.
process.env.DATABASE_URL = process.env.DATABASE_URL_DIRECT

if (!process.env.DATABASE_URL) {
  console.error('migrations: FAILED - DATABASE_URL_DIRECT is not set')
  process.exit(1)
}

try {
  execSync('npx payload migrate', { stdio: 'inherit' })
  console.log('migrations: ok')
} catch {
  console.error('migrations: FAILED - deploy dibatalkan')
  process.exit(1)
}
