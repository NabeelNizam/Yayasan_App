import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }))

const created: Record<string, unknown>[] = []
const updated: Record<string, unknown>[] = []
let findResult: { docs: Record<string, unknown>[] } = { docs: [] }

const payloadDouble = {
  find: vi.fn(async () => findResult),
  create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
    const doc = { id: created.length + 1, ...data }
    created.push(doc)
    return doc
  }),
  update: vi.fn(async ({ id, data }: { id: number | string; data: Record<string, unknown> }) => {
    updated.push({ id, ...data })
    return { id, ...data }
  }),
}
vi.mock('payload', () => ({ getPayload: vi.fn(async () => payloadDouble) }))

import { checkRateLimit } from '@/features/rate-limit/check'

beforeEach(() => {
  created.length = 0
  updated.length = 0
  findResult = { docs: [] }
  vi.clearAllMocks()
})

const opts = { key: 'submit-feedback:1.2.3.4', limit: 5, windowMs: 60000, now: 1000000 }

describe('checkRateLimit', () => {
  it('creates a window row and allows the first request', async () => {
    const r = await checkRateLimit(opts)
    expect(r.allowed).toBe(true)
    expect(r.remaining).toBe(4)
    expect(created).toHaveLength(1)
    expect(created[0].count).toBe(1)
  })

  it('increments an existing in-window row', async () => {
    findResult = { docs: [{ id: 9, key: opts.key, count: 2, windowStart: new Date(1000000).toISOString() }] }
    const r = await checkRateLimit(opts)
    expect(r.allowed).toBe(true)
    expect(updated[0].count).toBe(3)
    expect(created).toHaveLength(0)
  })

  it('rejects when the count is at the limit', async () => {
    findResult = { docs: [{ id: 9, key: opts.key, count: 5, windowStart: new Date(1000000).toISOString() }] }
    const r = await checkRateLimit(opts)
    expect(r.allowed).toBe(false)
    expect(r.remaining).toBe(0)
  })

  it('starts a new window when the old one expired', async () => {
    findResult = {
      docs: [{ id: 9, key: opts.key, count: 5, windowStart: new Date(1000000 - 120000).toISOString() }],
    }
    const r = await checkRateLimit(opts)
    expect(r.allowed).toBe(true)
    expect(updated[0].count).toBe(1)
  })

  it('is not tripped by a different key', async () => {
    findResult = { docs: [] }
    const r = await checkRateLimit({ ...opts, key: 'submit-feedback:9.9.9.9' })
    expect(r.allowed).toBe(true)
  })
})
