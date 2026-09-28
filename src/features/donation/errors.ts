export function isUniqueViolation(e: unknown): boolean {
  const err = e as { name?: string; data?: { errors?: { message?: string }[] } }
  if (err?.name === 'ValidationError') return true
  if (Array.isArray(err?.data?.errors)) {
    return err.data.errors.some((x) => String(x?.message ?? '').toLowerCase().includes('unique'))
  }
  return false
}
