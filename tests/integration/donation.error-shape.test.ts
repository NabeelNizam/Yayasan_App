import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { hasSandbox } from './setup'
import { assertNotProd } from './guard'

const RUN = `it-err-${Date.now()}`

describe.runIf(hasSandbox)('Payload unique violation error shape (sandbox)', () => {
  let payload: import('payload').Payload

  beforeAll(async () => {
    assertNotProd()
    const { getPayload } = await import('payload')
    const { default: config } = await import('@payload-config')
    payload = await getPayload({ config })
  })

  afterAll(async () => {
    if (!payload) return
    await payload
      .delete({ collection: 'donors', where: { clientToken: { contains: RUN } }, overrideAccess: true })
      .catch(() => {})
  })

  it('second insert with the same clientToken throws and isUniqueViolation() is true', async () => {
    const { isUniqueViolation } = await import('@/features/donation/errors')
    const token = `${RUN}-tok`

    await payload.create({
      collection: 'donors',
      data: { campaignSlug: 'x', clientToken: token, name: 'A', amount: 10000, isPublic: false },
      overrideAccess: true,
    })

    let caught: unknown
    try {
      await payload.create({
        collection: 'donors',
        data: { campaignSlug: 'x', clientToken: token, name: 'B', amount: 10000, isPublic: false },
        overrideAccess: true,
      })
    } catch (e) {
      caught = e
    }

    expect(caught).toBeDefined()
    expect(isUniqueViolation(caught)).toBe(true)
  })
})
