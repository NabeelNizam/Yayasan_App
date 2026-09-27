import { describe, it, expect } from 'vitest'
import { isAdmin, isAdminOrEditor } from '@/access/rbac'

describe('RBAC', () => {
  it('isAdmin true only for admin', () => {
    expect(isAdmin({ role: 'admin' })).toBe(true)
    expect(isAdmin({ role: 'editor' })).toBe(false)
    expect(isAdmin(null)).toBe(false)
  })
  it('isAdminOrEditor true for both', () => {
    expect(isAdminOrEditor({ role: 'editor' })).toBe(true)
    expect(isAdminOrEditor({ role: 'admin' })).toBe(true)
    expect(isAdminOrEditor(null)).toBe(false)
  })
})
