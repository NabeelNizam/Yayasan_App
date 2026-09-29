import { test, expect } from '@playwright/test'
import { closeDb } from './helpers/db'
import { KAJIAN_SLUGS, seedKajian, deleteKajian } from './helpers/kajian'

/**
 * Kajian detail pages (/kajian/[slug]) and the not-found edge case.
 *
 * The page has three rendering branches, one per content type, plus a 404
 * when the slug does not exist. Each is exercised against a seeded document.
 */

test.describe.configure({ mode: 'serial' })

test.describe('kajian detail', () => {
  test.beforeAll(async () => {
    await seedKajian()
  })

  test.afterAll(async () => {
    await deleteKajian()
    await closeDb()
  })

  test('video: renders a YouTube embed', async ({ page }) => {
    await page.goto(`/kajian/${KAJIAN_SLUGS.video}`)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Kajian Video')
    await expect(page.locator('iframe[src*="youtube.com/embed/dQw4w9WgXcQ"]')).toBeVisible({
      timeout: 15_000,
    })
  })

  test('artikel: renders the rich text body', async ({ page }) => {
    await page.goto(`/kajian/${KAJIAN_SLUGS.artikel}`)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Kajian Artikel')
    await expect(page.locator('.prose')).toContainText('Isi artikel')
  })

  test('kitab renders the PDF download link', async ({ page }) => {
    await page.goto(`/kajian/${KAJIAN_SLUGS.kitab}`)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Kajian Kitab')
    const link = page.getByRole('link', { name: /Unduh \/ Buka Kitab/ })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('target', '_blank')
  })

  test('unknown slug returns 404', async ({ page }) => {
    const res = await page.goto('/kajian/does-not-exist-xyz')
    expect(res?.status()).toBe(404)
  })
})
