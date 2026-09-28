import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { hasSandbox } from './setup'
import { assertNotProd } from './guard'

const RUN = `it-${Date.now()}`

describe.runIf(hasSandbox)('access control e2e (sandbox)', () => {
  let payload: import('payload').Payload

  beforeAll(async () => {
    assertNotProd()
    const { getPayload } = await import('payload')
    const { default: config } = await import('@payload-config')
    payload = await getPayload({ config })
  })

  afterAll(async () => {
    if (!payload) return
    await payload.delete({ collection: 'donors', where: { clientToken: { contains: RUN } }, overrideAccess: true }).catch(() => {})
    await payload.delete({ collection: 'publikasi', where: { slug: { contains: RUN } }, overrideAccess: true }).catch(() => {})
  })

  it('anonymous sees published publikasi but not drafts; donors only when isPublic', async () => {
    const pub = await payload.create({
      collection: 'publikasi',
      data: { title: `${RUN} published`, slug: `${RUN}-pub`, date: new Date().toISOString(), _status: 'published' },
      overrideAccess: true,
    })
    await payload.create({
      collection: 'publikasi',
      data: { title: `${RUN} draft`, slug: `${RUN}-draft`, date: new Date().toISOString(), _status: 'draft' },
      overrideAccess: true,
    })
    await payload.create({
      collection: 'donors',
      data: { campaignSlug: 'x', clientToken: `${RUN}-public`, name: 'Public', amount: 1000, isPublic: true },
      overrideAccess: true,
    })
    await payload.create({
      collection: 'donors',
      data: { campaignSlug: 'x', clientToken: `${RUN}-private`, name: 'Private', amount: 1000, isPublic: false },
      overrideAccess: true,
    })

    // anon (overrideAccess:false, no user)
    const anonPub = await payload.find({
      collection: 'publikasi',
      overrideAccess: false,
      where: { slug: { contains: RUN } },
    })
    expect(anonPub.docs.length).toBe(1)
    expect(anonPub.docs[0]._status).toBe('published')

    const anonDonors = await payload.find({
      collection: 'donors',
      overrideAccess: false,
      where: { clientToken: { contains: RUN } },
    })
    expect(anonDonors.docs.length).toBe(1)
    expect((anonDonors.docs[0] as { isPublic: boolean }).isPublic).toBe(true)

    // admin (overrideAccess:true) sees both
    const adminPub = await payload.find({
      collection: 'publikasi',
      overrideAccess: true,
      where: { slug: { contains: RUN } },
    })
    expect(adminPub.docs.length).toBe(2)

    expect(pub.id).toBeTruthy()
  })
})
