import { test, expect, Page } from '@playwright/test'
import {
  RUN_TAG,
  countContactMessagesContaining,
  cleanupTaggedRows,
  closeDb,
  resetFeedbackBuckets,
} from './helpers/db'

/**
 * Feedback / Kritik & Saran form on /kontak.
 *
 * Covers the happy path plus the edge cases the form actually implements:
 * client validation, the honeypot, the anonymous toggle, and the server-side
 * rate limiter (5 per minute per client).
 */

async function submitOne(page: Page, message: string, rating = 5) {
  await page.getByRole('radio').nth(rating - 1).click()
  await page.locator('#message').fill(message)
  await page.getByRole('button', { name: 'Kirim Kritik & Saran' }).click()
}

test.describe('feedback form', () => {
  test.beforeEach(async () => {
    // Every test hits the same client key (::1), so a leftover window from a
    // previous test would make the cap assertions non-deterministic.
    await resetFeedbackBuckets()
  })

  test.afterAll(async () => {
    await cleanupTaggedRows(RUN_TAG)
    await closeDb()
  })

  test('happy path: submit disabled until valid, then succeeds and persists', async ({ page }) => {
    await page.goto('/kontak')
    const submit = page.getByRole('button', { name: 'Kirim Kritik & Saran' })
    await expect(submit).toBeDisabled()

    await page.getByLabel('Nama', { exact: true }).fill(`${RUN_TAG} Budi`)
    await page.getByRole('radio').nth(4).click()
    await expect(submit).toBeDisabled()

    await page.locator('#message').fill(`Pesan uji otomatis ${RUN_TAG}`)
    await expect(submit).toBeEnabled()

    await submit.click()
    await expect(page.getByRole('heading', { name: 'Terima Kasih!' })).toBeVisible({
      timeout: 20_000,
    })

    await expect
      .poll(async () => countContactMessagesContaining(RUN_TAG), { timeout: 15_000 })
      .toBeGreaterThan(0)
  })

  test('anonymous toggle disables the name field', async ({ page }) => {
    await page.goto('/kontak')
    const name = page.getByLabel('Nama', { exact: true })
    await expect(name).toBeEnabled()
    await page.getByRole('switch').click()
    await expect(name).toBeDisabled()
  })

  test('honeypot: a filled hidden field blocks the write with an error', async ({ page }) => {
    await page.goto('/kontak')
    await page.getByRole('radio').nth(3).click()
    await page.locator('#message').fill(`Spam ${RUN_TAG}`)
    await page.locator('input[name="website"]').fill('http://spam.example', { force: true })
    await page.getByRole('button', { name: 'Kirim Kritik & Saran' }).click()

    await expect(page.getByText('Spam terdeteksi')).toBeVisible({ timeout: 20_000 })
    expect(await countContactMessagesContaining(`Spam ${RUN_TAG}`)).toBe(0)
  })

  test('rate limit: submissions past the 5/minute cap are rejected', async ({ page }) => {
    await page.goto('/kontak')
    const tag = `${RUN_TAG}-rl`

    let accepted = 0
    let sawRejection = false
    for (let i = 0; i < 8; i++) {
      await submitOne(page, `${tag} #${i}`)

      const outcome = await Promise.race([
        page
          .getByRole('heading', { name: 'Terima Kasih!' })
          .waitFor({ state: 'visible', timeout: 20_000 })
          .then(() => 'accepted' as const),
        page
          .getByText('Terlalu banyak pengiriman')
          .waitFor({ state: 'visible', timeout: 20_000 })
          .then(() => 'rejected' as const),
      ]).catch(() => 'unknown' as const)

      if (outcome === 'rejected') {
        sawRejection = true
        break
      }
      if (outcome === 'accepted') accepted++
      // Form resets ~3s after an accepted submit; let it return before retry.
      await page.waitForTimeout(3300)
    }

    expect(sawRejection, 'expected the limiter to reject within the cap window').toBe(true)
    expect(accepted).toBeLessThanOrEqual(5)
    const persisted = await countContactMessagesContaining(tag)
    expect(persisted).toBeGreaterThan(0)
    expect(persisted).toBeLessThanOrEqual(5)
  })
})
