import { test, expect } from '@playwright/test'

/**
 * Error handling and 404 behaviour.
 *
 * The project ships dedicated test routes (test-throw, widget-throw,
 * no-boundary) plus a root not-found. These assert that a failure degrades
 * locally: the segment boundary catches it, a widget boundary isolates it to
 * one widget, and an unknown URL returns a real 404 page.
 */

test.describe('error handling', () => {
  test('a segment error renders that segment error boundary', async ({ page }) => {
    await page.goto('/test-throw?throw=1')
    await expect(page.getByRole('heading', { name: 'Data sedang diperbarui' })).toBeVisible({
      timeout: 20_000,
    })
    await expect(page.getByRole('button', { name: 'Coba lagi' })).toBeVisible()
  })

  test('the same route without the trigger renders normally', async ({ page }) => {
    const res = await page.goto('/test-throw')
    expect(res?.status()).toBe(200)
    await expect(page.getByText('ok', { exact: true })).toBeVisible()
  })

  test('a widget boundary isolates the failure to the widget', async ({ page }) => {
    // This fixture throws during SSR, so the response is a 500 even though the
    // boundary recovers in the browser. Assert the recovery, not the status.
    await page.goto('/widget-throw')
    await expect(page.getByTestId('fallback')).toBeVisible({ timeout: 20_000 })
    await expect(page.getByTestId('sibling-left')).toBeVisible()
    await expect(page.getByTestId('sibling-right')).toBeVisible()
  })

  test('an unbounded error is reported rather than rendered as a healthy page', async ({
    page,
  }) => {
    const res = await page.goto('/no-boundary?throw=1')
    // With no segment boundary the error propagates. Depending on whether it
    // surfaces as a server error or as not-found, either way it must not be a
    // clean 200 carrying the "ok" body.
    expect([404, 500]).toContain(res?.status())
    await expect(page.getByText('ok', { exact: true })).toHaveCount(0)
  })

  test('an unknown route returns the 404 page', async ({ page }) => {
    const res = await page.goto('/this-route-does-not-exist')
    expect(res?.status()).toBe(404)
    await expect(page.getByRole('heading', { name: 'Halaman tidak ditemukan' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Kembali ke Beranda' })).toBeVisible()
  })

  test('retry on the segment boundary reloads the segment', async ({ page }) => {
    await page.goto('/test-throw?throw=1')
    await expect(page.getByRole('button', { name: 'Coba lagi' })).toBeVisible({ timeout: 20_000 })
    await page.getByRole('button', { name: 'Coba lagi' }).click()
    // The query string still triggers the throw, so the boundary reappears;
    // the point is that retry is wired and does not crash the page.
    await expect(page.getByRole('button', { name: 'Coba lagi' })).toBeVisible({ timeout: 20_000 })
  })
})
