import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const MIGRATIONS_DIR = path.join(process.cwd(), 'src/migrations')

function migrationSql(): string {
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
  return files
    .map((f) => fs.readFileSync(path.join(MIGRATIONS_DIR, f), 'utf8'))
    .join('\n')
}

describe('donors.client_token unique index (Plan 6 Task 7)', () => {
  const sql = migrationSql()

  it('creates a UNIQUE index on donors.client_token', () => {
    expect(sql).toMatch(/CREATE UNIQUE INDEX "donors_client_token_idx"/)
  })

  it('keeps the column NOT NULL', () => {
    expect(sql).toMatch(/"client_token" varchar NOT NULL/)
  })
})
