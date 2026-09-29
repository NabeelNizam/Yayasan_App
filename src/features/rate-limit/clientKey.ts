/**
 * Derive a client identifier from request headers for rate limiting.
 * Prefers the left-most x-forwarded-for entry (the real client at the edge),
 * then x-real-ip, then a fixed "unknown" bucket.
 */
export function clientKeyFromHeaders(headers: Record<string, string | undefined>): string {
  const xff = headers['x-forwarded-for']
  if (xff) {
    const first = xff.split(',')[0]?.trim()
    if (first) return first
  }
  const real = headers['x-real-ip']?.trim()
  if (real) return real
  return 'unknown'
}
