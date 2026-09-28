import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const SITE_DIR = path.join(process.cwd(), 'src/app/(site)')

function walk(dir: string): string[] {
  const out: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(p))
    else if (entry.name === 'page.tsx') out.push(p)
  }
  return out
}

/**
 * Next 16 parses route segment config with a static AST analyzer and rejects
 * values it cannot resolve to a literal ("Unknown identifier ... at
 * revalidate"), failing the whole build. This guards against reintroducing
 * an imported identifier for `revalidate`.
 */
describe('route segment config is statically analyzable', () => {
  const pages = walk(SITE_DIR)

  it('finds the public pages', () => {
    expect(pages.length).toBeGreaterThan(0)
  })

  it('every `export const revalidate` is a numeric literal', () => {
    const offenders: string[] = []
    for (const file of pages) {
      const src = fs.readFileSync(file, 'utf8')
      const m = src.match(/^export const revalidate\s*=\s*(.+)$/m)
      if (!m) continue
      const value = m[1].trim()
      if (!/^\d+$/.test(value)) {
        offenders.push(`${path.relative(process.cwd(), file)} -> ${value}`)
      }
    }
    expect(offenders).toEqual([])
  })

  it('no page imports a revalidate constant', () => {
    const offenders = pages.filter((file) => {
      const src = fs.readFileSync(file, 'utf8')
      return /import\s*\{[^}]*REVALIDATE_SECONDS[^}]*\}/.test(src)
    })
    expect(offenders.map((f) => path.relative(process.cwd(), f))).toEqual([])
  })
})
