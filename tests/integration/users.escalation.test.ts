import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { hasSandbox } from './setup'

const RUN = `it-sec-${Date.now()}`

describe.runIf(hasSandbox)('Users access control e2e (sandbox)', () => {
  let payload: import('payload').Payload
  let editorId: number | string

  beforeAll(async () => {
    const { getPayload } = await import('payload')
    const { default: config } = await import('@payload-config')
    payload = await getPayload({ config })

    const editor = await payload.create({
      collection: 'users',
      data: { email: `${RUN}@example.com`, password: 'secret-password-123', role: 'editor' },
      overrideAccess: true,
    })
    editorId = editor.id
  })

  afterAll(async () => {
    if (!payload || !editorId) return
    await payload.delete({ collection: 'users', id: editorId, overrideAccess: true }).catch(() => {})
  })

  it('an editor cannot escalate their own role to admin', async () => {
    // Simulate the editor acting on themselves: overrideAccess false + req.user = the editor.
    let threw = false
    try {
      await payload.update({
        collection: 'users',
        id: editorId,
        data: { role: 'admin' },
        req: { user: { id: editorId, role: 'editor', collection: 'users' } } as never,
        overrideAccess: false,
      })
    } catch {
      threw = true
    }

    const after = await payload.findByID({ collection: 'users', id: editorId, overrideAccess: true })
    expect((after as { role: string }).role).toBe('editor')
    // Either the field access strips the change or the call throws - role must NOT become admin.
    expect(threw || (after as { role: string }).role === 'editor').toBe(true)
  })
})
