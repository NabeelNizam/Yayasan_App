import { test, expect } from '@playwright/test'

/**
 * HTTP endpoints under /api.
 *
 * These are the contracts other systems depend on: the health probes a host
 * polls, the legacy donation route that must stay an explicit 501, and the
 * outbox relay that must reject callers without the shared secret.
 */

test.describe('api', () => {
  test('GET /api/health returns ok', async ({ request }) => {
    const res = await request.get('/api/health')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(typeof body.ts).toBe('number')
  })

  test('GET /api/health/ready confirms the database is reachable', async ({ request }) => {
    const res = await request.get('/api/health/ready')
    expect(res.status()).toBe(200)
    expect((await res.json()).ok).toBe(true)
  })

  test('POST /api/donasi is an explicit 501, not a silent bypass', async ({ request }) => {
    const res = await request.post('/api/donasi')
    expect(res.status()).toBe(501)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toMatch(/belum tersedia/i)
  })

  test('POST /api/outbox/relay rejects a missing secret with 401', async ({ request }) => {
    const res = await request.post('/api/outbox/relay')
    expect(res.status()).toBe(401)
    expect((await res.json()).error).toBe('unauthorized')
  })

  test('POST /api/outbox/relay rejects a wrong secret with 401', async ({ request }) => {
    const res = await request.post('/api/outbox/relay', {
      headers: { 'x-relay-secret': 'definitely-not-the-secret' },
    })
    expect(res.status()).toBe(401)
  })

  test('POST /api/outbox/relay with the correct secret drains the queue', async ({ request }) => {
    const secret = process.env.RELAY_SECRET ?? 'ci-e2e-relay-secret'
    const res = await request.post('/api/outbox/relay', {
      headers: { 'x-relay-secret': secret },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(typeof body.claimed).toBe('number')
    expect(Array.isArray(body.claimedIds)).toBe(true)
  })

  test('GET /api/outbox/relay is also gated by the secret', async ({ request }) => {
    const res = await request.get('/api/outbox/relay')
    expect(res.status()).toBe(401)
  })
})
