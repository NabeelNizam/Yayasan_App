import { describe, it, expect } from 'vitest'
import { POST } from '@/app/api/donasi/route'

describe('POST /api/donasi (legacy, payment on hold)', () => {
  it('returns 501 and does not create anything', async () => {
    const res = await POST()
    expect(res.status).toBe(501)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(String(body.error)).toContain('belum tersedia')
  })
})
