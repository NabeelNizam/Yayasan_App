export type Role = 'admin' | 'editor'

export const isAdmin = (u: unknown): boolean =>
  (u as { role?: Role } | null | undefined)?.role === 'admin'

export const isAdminOrEditor = (u: unknown): boolean => {
  const role = (u as { role?: Role } | null | undefined)?.role
  return role === 'admin' || role === 'editor'
}
