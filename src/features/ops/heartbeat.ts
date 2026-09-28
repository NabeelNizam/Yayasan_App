export function isStale(lastSuccessMs: number, intervalMs: number, nowMs: number): boolean {
  return nowMs - lastSuccessMs > intervalMs * 1.5
}
