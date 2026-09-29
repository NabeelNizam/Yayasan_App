import { describe, it, expect, vi } from 'vitest'
import type { Payload } from 'payload'

vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }))

import { runPhbiSync } from '@/features/sync/phbi/sync'

// Minimal in-memory Payload double capturing call counts.
function makePayloadDouble(seed: Record<string, unknown>[]) {
  const store = new Map<string, Record<string, unknown>>()
  for (const s of seed) store.set(String(s.rowKey), { ...s })

  const counts = { find: 0, create: 0, update: 0 }

  const payload = {
    find: async ({ where }: { where: { rowKey: { in: string[] } } }) => {
      counts.find++
      const keys = where.rowKey.in
      const docs = keys.map((k) => store.get(k)).filter(Boolean)
      return { docs }
    },
    create: async ({ data }: { data: Record<string, unknown> }) => {
      counts.create++
      store.set(String(data.rowKey), { id: store.size + 1, ...data })
      return data
    },
    update: async ({ data }: { data: Record<string, unknown> }) => {
      counts.update++
      store.set(String(data.rowKey), { ...store.get(String(data.rowKey)), ...data })
      return data
    },
  } as unknown as Payload

  return { payload, counts, store }
}

const CSV = ['event,year,date,description', 'Alpha,2024,2024-01-01,d1', 'Beta,2024,2024-01-02,d2'].join('\n')

function serveCsv(text: string): string {
  const dataUri = `data:text/csv,${encodeURIComponent(text)}`
  globalThis.fetch = (async () => ({ text: async () => text })) as unknown as typeof fetch
  return dataUri
}

describe('runPhbiSync (batch lookup)', () => {
  it('does ONE find() for N rows, not one per row', async () => {
    const { payload, counts } = makePayloadDouble([])
    const csvUrl = serveCsv(CSV)
    const res = await runPhbiSync(payload, csvUrl)
    expect(res.created).toBe(2)
    expect(counts.find).toBe(1)
  })

  it('skips unchanged rows on a second run (no writes)', async () => {
    const first = makePayloadDouble([])
    const csvUrl = serveCsv(CSV)
    await runPhbiSync(first.payload, csvUrl)

    const { payload, counts } = makePayloadDouble([...first.store.values()])
    const res = await runPhbiSync(payload, csvUrl)
    expect(res.skipped).toBe(2)
    expect(counts.update).toBe(0)
    expect(counts.create).toBe(1) // only the sync-run record
  })

  it('updates only rows whose content changed', async () => {
    const first = makePayloadDouble([])
    const csvUrl = serveCsv(CSV)
    await runPhbiSync(first.payload, csvUrl)

    const changed = [...first.store.values()].map((d) =>
      d.rowKey === 'alpha-2024' ? { ...d, description: 'CHANGED' } : d,
    )
    const { payload, counts } = makePayloadDouble(changed)
    const res = await runPhbiSync(payload, csvUrl)
    expect(res.updated).toBe(1)
    expect(res.skipped).toBe(1)
    expect(counts.update).toBe(1)
  })

  it('throws when no CSV url is configured', async () => {
    const { payload } = makePayloadDouble([])
    const saved = process.env.PHBI_SHEET_CSV_URL
    delete process.env.PHBI_SHEET_CSV_URL
    await expect(runPhbiSync(payload)).rejects.toThrow('PHBI_SHEET_CSV_URL')
    if (saved !== undefined) process.env.PHBI_SHEET_CSV_URL = saved
  })

  it('records a failed sync-run and rethrows when the fetch fails', async () => {
    const { payload, counts } = makePayloadDouble([])
    globalThis.fetch = (async () => {
      throw new Error('network down')
    }) as unknown as typeof fetch

    await expect(runPhbiSync(payload, 'data:text/csv,event,year,date')).rejects.toThrow('network down')
    expect(counts.create).toBe(1)
  })
})
