import { execSync } from 'node:child_process'
import process from 'node:process'

process.env.DATABASE_URL = process.env.DATABASE_URL_DIRECT

try {
  execSync('psql "$DATABASE_URL_DIRECT" -c "select pg_advisory_lock(918273645)"', {
    stdio: 'inherit',
    shell: true,
  })
  execSync('npm run migrate', { stdio: 'inherit' })
  console.log('migrations: ok')
} catch {
  console.error('migrations: FAILED - deploy dibatalkan')
  process.exit(1)
}
