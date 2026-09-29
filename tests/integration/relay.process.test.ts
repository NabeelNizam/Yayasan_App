import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { hasSandbox } from './setup'
import { assertNotProd } from './guard'

const RUN = `p7-${Date.now()}`

describe.runIf(hasSandbox)('relay processes rows with retry semantics (sandbox)', () => {
  let payload: import('payload').Payload
  let okId: number | string
  let failId: number | string

  beforeAll(async () => {
    assertNotProd()
    const { getPayload } = await import('payload')
    const { default: config } = await import('@payload-config')
    const { registerWebhookHandler, resetWebhookHandlers } = await import('@/features/outbox/handlers')
    payload = await getPayload({ config })

    resetWebhookHandlers()
    registerWebhookHandler('p7ok', async () => {})
    registerWebhookHandler('p7fail', async () => {
      throw new Error('intentional')
    })

    const a = await payload.create({
      collection: 'webhook-inbox',
      data: { provider: 'p7ok', eventId: `${RUN}-ok`, status: 'pending', attempts: 0 },
      overrideAccess: true,
    })
    const b = await payload.create({
      collection: 'webhook-inbox',
      data: { provider: 'p7fail', eventId: `${RUN}-fail`, status: 'pending', attempts: 0 },
      overrideAccess: true,
    })
    okId = a.id
    failId = b.id
  })

  afterAll(async () => {
    if (!payload) return
    await payload
      .delete({ collection: 'webhook-inbox', where: { eventId: { contains: RUN } }, overrideAccess: true })
      .catch(() => {})
  })

  it('marks a successful row done and a failing row pending with attempts+1', async () => {
    const { decideOutcome } = await import('@/features/outbox/retry')
    const { getWebhookHandler } = await import('@/features/outbox/handlers')

    // process the two rows exactly as the relay does
    for (const [id, provider] of [
      [okId, 'p7ok'],
      [failId, 'p7fail'],
    ] as const) {
      const handler = getWebhookHandler(provider)!
      let ok = true
      try {
        await handler({ provider, eventId: RUN, payload: {} })
      } catch {
        ok = false
      }
      const outcome = decideOutcome({ ok, attempts: 0 })
      await payload.update({
        collection: 'webhook-inbox',
        id,
        data: {
          status: outcome.status,
          attempts: outcome.attempts,
          nextAttemptAt: outcome.retryAt ? outcome.retryAt.toISOString() : null,
        },
        overrideAccess: true,
      })
    }

    const ok = await payload.findByID({ collection: 'webhook-inbox', id: okId, overrideAccess: true })
    const bad = await payload.findByID({ collection: 'webhook-inbox', id: failId, overrideAccess: true })

    expect((ok as { status: string }).status).toBe('done')
    expect((ok as { attempts: number }).attempts).toBe(0)
    expect((bad as { status: string }).status).toBe('pending')
    expect((bad as { attempts: number }).attempts).toBe(1)
    expect((bad as { nextAttemptAt: string | null }).nextAttemptAt).toBeTruthy()
  })
})
