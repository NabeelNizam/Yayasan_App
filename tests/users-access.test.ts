import { describe, it, expect } from 'vitest'
import { canUpdateUser, canReadUsers, canSetRole } from '@/access/users'

const admin = { id: 1, role: 'admin' as const }
const editor = { id: 2, role: 'editor' as const }

describe('Users access control', () => {
  describe('canUpdateUser', () => {
    it('admin may update anyone', () => {
      expect(canUpdateUser(admin, 99)).toBe(true)
    })
    it('editor may update only their own record', () => {
      expect(canUpdateUser(editor, 2)).toBe(true)
      expect(canUpdateUser(editor, 99)).toBe(false)
    })
    it('anonymous may not update anyone', () => {
      expect(canUpdateUser(null, 2)).toBe(false)
    })
  })

  describe('canSetRole (field-level: prevents self-promotion)', () => {
    it('only admin may change the role field', () => {
      expect(canSetRole(admin)).toBe(true)
      expect(canSetRole(editor)).toBe(false)
      expect(canSetRole(null)).toBe(false)
    })
  })

  describe('canReadUsers', () => {
    it('only admin may read the user list', () => {
      expect(canReadUsers(admin)).toBe(true)
      expect(canReadUsers(editor)).toBe(false)
      expect(canReadUsers(null)).toBe(false)
    })
    it('an authenticated non-admin may read only themselves', () => {
      expect(canReadUsers(editor, 2)).toBe(true)
      expect(canReadUsers(editor, 99)).toBe(false)
    })
  })
})
