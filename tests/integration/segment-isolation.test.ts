import { describe, it, expect } from 'vitest'

/**
 * Segment isolation (Plan 2 Task 7) - asserts the REAL Next 16 behaviour.
 *
 * Empirically verified: when a Server Component throws, the RSC render fails
 * and the response is HTTP 500, regardless of a same-segment error.tsx. The
 * error.tsx still provides graceful client-side degradation and must not leak
 * the raw error. What isolation guarantees is that SIBLING routes stay healthy.
 *
 * Requires a running production server:
 *   npm run build && npm start
 */
const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000'

const get = async (p: string) => {
  const r = await fetch(`${BASE}${p}`, { redirect: 'manual' })
  return { status: r.status, body: await r.text() }
}

describe('segment isolation', () => {
  it('a thrown segment degrades without leaking, siblings stay 200', async () => {
    const [bounded, unbounded, home, tentang, health] = await Promise.all([
      get('/test-throw?throw=1'),
      get('/no-boundary?throw=1'),
      get('/'),
      get('/tentang-kami'),
      get('/api/health'),
    ])

    // A throwing server segment fails the response (500) - documented Next 16
    // behaviour, NOT 200. Both bounded and unbounded respond 500.
    expect(bounded.status).toBe(500)
    expect(unbounded.status).toBe(500)

    // The raw error must never reach the client.
    expect(bounded.body).not.toContain('intentional test error')

    // Sibling routes are completely unaffected (the isolation guarantee).
    expect(home.status).toBe(200)
    expect(tentang.status).toBe(200)
    expect(health.status).toBe(200)
    expect(home.body).toContain('Yayasan Al-Muhajirin')

    // Non-throwing hits on the same routes are healthy (proves the flag drives it).
    const [ok1, ok2] = await Promise.all([get('/test-throw'), get('/no-boundary')])
    expect(ok1.status).toBe(200)
    expect(ok2.status).toBe(200)
    expect(ok1.body).toContain('ok')
  })
})