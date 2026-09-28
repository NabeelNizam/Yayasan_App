import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }))

const store = new Map<string, Record<string, unknown>>()
let nextId = 1

const payloadDouble = {
  find: vi.fn(async ({ where }: { where: { clientToken?: { equals?: string } } }) => {
    const tok = where?.clientToken?.equals
    return { docs: tok && store.has(tok) ? [store.get(tok)] : [] }
  }),
  create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
    const tok = String(data.clientToken)
    if (store.has(tok)) {
      throw Object.assign(new Error('Value must be unique'), {
        name: 'ValidationError',
        data: { errors: [{ message: 'Value must be unique', path: 'clientToken' }] },
      })
    }
    const doc = { id: nextId++, ...data }
    store.set(tok, doc)
    return doc
  }),
  db: {
    beginTransaction: vi.fn(async () => 1),
    commitTransaction: vi.fn(async () => {}),
    rollbackTransaction: vi.fn(async () => {}),
  },
}

vi.mock('payload', () => ({ getPayload: vi.fn(async () => payloadDouble) }))
vi.mock('@payload-config', () => ({ default: {} }))

import { submitDonation } from '@/features/donation/actions'
import { isUniqueViolation } from '@/features/donation/errors'

const base = {
  campaignSlug: 'renovasi-masjid',
  clientToken: 'tok-12345678',
  donorName: 'Ali Akbar',
  anonymous: false,
  whatsapp: '081234567890',
  amount: 50000,
}

beforeEach(() => {
  store.clear()
  nextId = 1
  vi.clearAllMocks()
})

describe('isUniqueViolation', () => {
  it('detects a Payload ValidationError', () => {
    expect(isUniqueViolation({ name: 'ValidationError' })).toBe(true)
  })
  it('detects a "unique" message in data.errors', () => {
    expect(isUniqueViolation({ data: { errors: [{ message: 'Value must be unique' }] } })).toBe(true)
  })
  it('returns false for unrelated errors', () => {
    expect(isUniqueViolation(new Error('boom'))).toBe(false)
  })
})

describe('submitDonation', () => {
  it('creates once and dedupes a second submit with the same token', async () => {
    const a = await submitDonation(base)
    const b = await submitDonation(base)
    expect(a.ok).toBe(true)
    expect(b.ok).toBe(true)
    expect((b as { deduped?: boolean }).deduped).toBe(true)
    expect(store.size).toBe(1)
  })

  it('rejects an invalid donation without creating a row', async () => {
    const r = await submitDonation({ ...base, whatsapp: 'bad' })
    expect(r.ok).toBe(false)
    expect(store.size).toBe(0)
  })

  it('stores Hamba Allah when anonymous', async () => {
    await submitDonation({ ...base, anonymous: true, donorName: 'Rahasia' })
    const doc = [...store.values()][0]
    expect(doc.name).toBe('Hamba Allah')
  })
})
