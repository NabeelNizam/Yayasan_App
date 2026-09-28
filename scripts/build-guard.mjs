import { execSync } from 'node:child_process'
import process from 'node:process'

const run = (cmd) => execSync(cmd, { stdio: 'inherit' })

if (process.env.VERCEL_ENV === 'production') {
  run('node scripts/migrate.mjs')
} else {
  console.log('skip migrate (non-production deploy)')
}

run('npx next build')
