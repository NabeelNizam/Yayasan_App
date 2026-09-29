import { test, expect, Page } from '@playwright/test'
import {
  seedAdminUser,
  deleteAdminUser,
  countE2eAdminUsers,
  E2E_ADMIN_EMAIL,
  E2E_ADMIN_PASSWORD,
} from './helpers/admin'
import { db, closeDb } from './helpers/db'

/**
 * Payload admin at /admin.
 *
 * The users table is empty in the test database, which makes /admin show the
 * create-first-user screen instead of a login form. The suite therefore
 * provisions a temporary admin through the Payload Local API first, exercises
 * a real login and a create + edit round trip, then removes the user and the
 * row it created. afterAll asserts the account is gone so a crash cannot leave
 * a live credential behind.
 */

test.describe.configure({ mode: 'serial' })

const ADMIN_ROW_MARKER = 'admin-e2e-'

async function login(page: Page) {
  await page.goto('/admin/login')
  await page.locator('#field-email').fill(E2E_ADMIN_EMAIL)
  await page.locator('#field-password').fill(E2E_ADMIN_PASSWORD)
  await page.getByRole('button', { name: /login|masuk|sign in/i }).click()
  // Reaching /admin is not enough: a failed login also lands on /admin/login,
  // which matches a bare /admin prefix. Require the login screen to be gone.
  await page.waitForURL((url) => url.pathname.startsWith('/admin') && !url.pathname.includes('/login'), {
    timeout: 30_000,
  })
  await expect(page.getByRole('button', { name: 'Collections' })).toBeVisible({
    timeout: 20_000,
  })
}

test.describe('payload admin', () => {
  test.beforeAll(async () => {
    await seedAdminUser()
  })

  test.afterAll(async () => {
    await db().query(`delete from contact_messages where message like $1`, [
      `${ADMIN_ROW_MARKER}%`,
    ])
    await deleteAdminUser()
    const left = await countE2eAdminUsers()
    expect(left, 'temporary admin must be removed').toBe(0)
    await closeDb()
  })

  test('login page rejects a wrong password', async ({ page }) => {
    await page.goto('/admin/login')
    await page.locator('#field-email').fill(E2E_ADMIN_EMAIL)
    await page.locator('#field-password').fill('definitely-wrong-password')
    await page.getByRole('button', { name: /login|masuk|sign in/i }).click()

    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 20_000 })
    await expect(page.locator('#field-password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Collections' })).toHaveCount(0)
  })

  test('login succeeds with the seeded credentials', async ({ page }) => {
    await login(page)
    await expect(page.getByRole('button', { name: 'Collections' })).toBeVisible({
      timeout: 20_000,
    })
  })

  test('can create and then edit a contact message', async ({ page }) => {
    await login(page)
    const marker = `${ADMIN_ROW_MARKER}${Date.now()}`

    await page.goto('/admin/collections/contact-messages/create')
    await page.locator('#field-message').fill(marker)
    await page.locator('#field-rating').fill('5')
    await page.getByRole('button', { name: /^save$/i }).first().click()

    await expect(page.getByText(/successfully created/i).first()).toBeVisible({
      timeout: 25_000,
    })
    await expect(page).toHaveURL(/\/admin\/collections\/contact-messages\/\d+/, {
      timeout: 25_000,
    })

    const editUrl = page.url()
    // Give the freshly created document a moment to settle into its edit form
    // before editing in place, so the second save targets the same document.
    await expect(page.locator('#field-message')).toHaveValue(marker, { timeout: 20_000 })
    await page.locator('#field-message').fill(`${marker} edited`)
    await page.getByRole('button', { name: /^save$/i }).first().click()
    await expect(page.getByRole('button', { name: /submitting/i })).toHaveCount(0, {
      timeout: 25_000,
    })

    await expect
      .poll(
        async () => {
          const r = await db().query(
            `select message from contact_messages where message like $1`,
            [`${ADMIN_ROW_MARKER}%`]
          )
          return r.rows.some((row) => (row.message as string).includes('edited'))
        },
        { timeout: 20_000 }
      )
      .toBe(true)

    await page.goto(editUrl)
    await expect(page.locator('#field-message')).toHaveValue(`${marker} edited`)
  })
})
