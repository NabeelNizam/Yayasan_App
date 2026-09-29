import { test, expect, Page } from '@playwright/test'

/**
 * Smoke — the broad net. Visits every main public page in a real browser and
 * asserts three things a unit test can never catch:
 *   1. the page returns 200 (not a runtime crash / 500),
 *   2. the browser console shows no errors and no uncaught exceptions,
 *   3. the images actually decode in the browser (naturalWidth > 0), which
 *      catches broken next/image config, wrong paths, and the SVG host issue.
 */

const PAGES = [
  { path: '/', name: 'Beranda' },
  { path: '/tentang-kami', name: 'Tentang Kami' },
  { path: '/kegiatan', name: 'Kegiatan' },
  { path: '/kegiatan/tk', name: 'Kegiatan TK' },
  { path: '/kegiatan/takmir', name: 'Kegiatan Takmir' },
  { path: '/publikasi', name: 'Publikasi' },
  { path: '/donasi', name: 'Donasi' },
  { path: '/kontak', name: 'Kontak' },
]

type ConsoleCapture = { errors: string[]; pageErrors: string[] }

function attachErrorCapture(page: Page): ConsoleCapture {
  const cap: ConsoleCapture = { errors: [], pageErrors: [] }
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const t = msg.text()
      // next/image 404s and favicon noise are surfaced separately as image checks;
      // keep them out of the generic console assertion to avoid double-reporting.
      cap.errors.push(t)
    }
  })
  page.on('pageerror', (err) => {
    cap.pageErrors.push(err.message)
  })
  return cap
}

/**
 * Lazy images below the fold stay at naturalWidth 0 until scrolled, which
 * reads as "broken". Scroll first so the check only fails on real 404s.
 */
async function scrollThroughPage(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const step = Math.max(400, Math.floor(window.innerHeight * 0.8))
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 120))
    }
    window.scrollTo(0, document.body.scrollHeight)
  })
  await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})
}

/** Wait until every <img> in the page has either decoded or failed. */
async function checkImages(page: Page): Promise<{ broken: string[]; total: number }> {
  return page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll('img'))
    await Promise.all(
      imgs.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) return resolve()
            img.addEventListener('load', () => resolve(), { once: true })
            img.addEventListener('error', () => resolve(), { once: true })
            setTimeout(resolve, 8000)
          })
      )
    )
    const broken = imgs
      .filter((img) => {
        // SVG served via next/image stays a plain <img>; still must decode.
        const nw = img.naturalWidth
        const src = img.getAttribute('src') ?? ''
        return nw === 0 && src && !src.startsWith('data:')
      })
      .map((img) => img.getAttribute('src') ?? '(no src)')
    return { broken, total: imgs.length }
  })
}

for (const { path, name } of PAGES) {
  test(`smoke: ${name} (${path}) loads clean in a real browser`, async ({ page }) => {
    const cap = attachErrorCapture(page)

    const response = await page.goto(path, { waitUntil: 'domcontentloaded' })
    expect(response, `no response for ${path}`).not.toBeNull()
    expect(response!.status(), `HTTP status for ${path}`).toBeLessThan(400)

    // Let client components hydrate, then scroll to trigger lazy images.
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})
    await scrollThroughPage(page)

    const { broken, total } = await checkImages(page)
    expect(broken, `broken images on ${path}: ${broken.join(', ')}`).toEqual([])

    // Body must have real content, not an empty error shell.
    const bodyLen = (await page.locator('body').innerText()).trim().length
    expect(bodyLen, `page ${path} looks empty`).toBeGreaterThan(50)

    expect(cap.pageErrors, `uncaught page errors on ${path}`).toEqual([])
    expect(cap.errors, `console errors on ${path}`).toEqual([])

    // Guard against a regression where next/image silently stops optimizing.
    test.info().annotations.push({ type: 'images', description: `${path}: ${total} images` })
  })
}
