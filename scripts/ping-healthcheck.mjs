export async function pingHealthcheck(url = process.env.HEALTHCHECK_PING_URL) {
  if (!url) return { ok: false, skipped: true }
  try {
    await fetch(url)
    return { ok: true, skipped: false }
  } catch {
    return { ok: false, skipped: false }
  }
}
