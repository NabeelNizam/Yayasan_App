import { describe, it, expect, vi, beforeEach } from 'vitest'

const created: Record<string, unknown>[] = []
const payloadDouble = {
  create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
    const doc = { id: created.length + 1, ...data }
    created.push(doc)
    return doc
  }),
}
vi.mock('payload', () => ({ getPayload: vi.fn(async () => payloadDouble) }))
vi.mock('@payload-config', () => ({ default: {} }))

import { submitFeedback } from '@/features/contact/actions'

const base = { rating: 5, message: 'Pelayanan bagus', honeypot: '' }

beforeEach(() => {
  created.length = 0
  vi.clearAllMocks()
})

describe('submitFeedback', () => {
  it('stores a valid feedback and returns ok', async () => {
    const r = await submitFeedback(base)
    expect(r.ok).toBe(true)
    expect(created).toHaveLength(1)
  })

  it('rejects (and does not store) when the honeypot is filled', async () => {
    const r = await submitFeedback({ ...base, honeypot: 'bot' })
    expect(r.ok).toBe(false)
    expect(created).toHaveLength(0)
  })

  it('rejects an invalid rating without storing', async () => {
    const r = await submitFeedback({ ...base, rating: 9 })
    expect(r.ok).toBe(false)
    expect(created).toHaveLength(0)
  })
})
