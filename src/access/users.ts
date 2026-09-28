import { isAdmin, type Role } from './rbac'

export type AuthUser = { id: number | string; role?: Role } | null | undefined

export function canUpdateUser(user: AuthUser, targetId: number | string): boolean {
  if (isAdmin(user)) return true
  return user?.id !== undefined && user.id === targetId
}

export function canSetRole(user: AuthUser): boolean {
  return isAdmin(user)
}

export function canReadUsers(user: AuthUser, targetId?: number | string): boolean {
  if (isAdmin(user)) return true
  if (targetId === undefined) return false
  return user?.id !== undefined && user.id === targetId
}
