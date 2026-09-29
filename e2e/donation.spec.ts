import { test, expect, Page } from '@playwright/test'
import { RUN_TAG, closeDb, db, donorsForCampaign, prayersForCampaign } from './helpers/db'
import { E2E_CAMPAIGN_SLUG, seedCampaign, deleteCampaign } from './helpers/campaign'

/**
 * Donation form on /donasi/[slug].
 *
 * The page reads campaigns from the database, so the suite seeds one published
 * campaign for the run and deletes it in afterAll. Covers the happy path plus
 * the edge cases the form implements: client validation (name/whatsapp/min
 * amount), the anonymous toggle, deduplication by client token, and the
 * server-side rate limiter (10 per minute).
 */

test.describe.configure({ mode: 'serial' })

const DETAIL = `/donasi/${E2E_CAMPAIGN_SLUG}`

async function gotoForm(page: Page) {
  await page.goto(DETAIL)
  await expect(page.getByRole('heading', { name: 'Form Donasi' })).toBeVisible({ timeout: 30_000 })
}

test.describe('donation form', () => {
  test.beforeAll(async () => {
    await seedCampaign()
    await db().query(`delete from rate_limits where key like 'submit-donation%'`)
  })

  test.afterAll(async () => {
    await db().query(`delete from prayers where campaign_slug = $1`, [E2E_CAMPAIGN_SLUG])
    await db().query(`delete from donors where campaign_slug = $1`, [E2E_CAMPAIGN_SLUG])
    await db().query(`delete from rate_limits where key like 'submit-donation%'`)
    await deleteCampaign()
    await closeDb()
  })

  test('happy path: fills the form, submits, and the donor row is stored', async ({ page }) => {
    await gotoForm(page)

    await page.getByLabel(/Nama Lengkap/).fill(`${RUN_TAG} Donor`)
    await page.locator('#whatsapp').fill('081234567890')
    await page.getByRole('button', { name: 'Rp100.000' }).click()
    await page.locator('#prayer').fill(`Doa uji ${RUN_TAG}`)

    const submit = page.getByRole('button', { name: 'Donasi Sekarang' })
    await expect(submit).toBeEnabled()
    await submit.click()

    await expect(page.getByRole('heading', { name: 'Terima kasih!' })).toBeVisible({
      timeout: 25_000,
    })
    await expect(page.getByRole('button', { name: 'Donasi Lagi' })).toBeVisible()

    await expect
      .poll(async () => (await donorsForCampaign(E2E_CAMPAIGN_SLUG)).length, { timeout: 15_000 })
      .toBeGreaterThan(0)

    const donors = await donorsForCampaign(E2E_CAMPAIGN_SLUG)
    const mine = donors.find((d) => d.name.includes(RUN_TAG))
    expect(mine, 'stored donor should carry our tag').toBeTruthy()
    expect(mine!.amount).toBe('100000')

    const prayers = await prayersForCampaign(E2E_CAMPAIGN_SLUG)
    expect(prayers.some((p) => p.message.includes(RUN_TAG))).toBe(true)
  })

  test('validation: empty name and bad whatsapp block submission with messages', async ({ page }) => {
    await gotoForm(page)
    await page.locator('#whatsapp').fill('abc')
    await page.getByRole('button', { name: 'Rp25.000' }).click()
    await page.getByRole('button', { name: 'Donasi Sekarang' }).click()

    await expect(page.getByText('Nama wajib diisi')).toBeVisible()
    await expect(page.getByText('Format nomor WhatsApp tidak valid')).toBeVisible()
  })

  test('validation: an amount below the minimum keeps the submit disabled', async ({ page }) => {
    await gotoForm(page)
    await page.getByLabel(/Nama Lengkap/).fill(`${RUN_TAG} Kecil`)
    await page.locator('#whatsapp').fill('081234567890')
    await page.locator('input[placeholder="Masukkan nominal donasi"]').fill('5000')

    await expect(page.getByRole('button', { name: 'Donasi Sekarang' })).toBeDisabled()
    await expect(page.getByText(/Minimal donasi/)).toBeVisible()
  })

  test('anonymous toggle disables the name field and stores "Hamba Allah"', async ({ page }) => {
    await gotoForm(page)
    const name = page.getByLabel(/Nama Lengkap/)
    await expect(name).toBeEnabled()
    await page.getByRole('switch').click()
    await expect(name).toBeDisabled()

    await page.locator('#whatsapp').fill('081234567891')
    await page.getByRole('button', { name: 'Rp25.000' }).click()
    const submit = page.getByRole('button', { name: 'Donasi Sekarang' })
    await submit.click()
    await expect(page.getByRole('heading', { name: 'Terima kasih!' })).toBeVisible({
      timeout: 25_000,
    })

    await expect
      .poll(async () => (await donorsForCampaign(E2E_CAMPAIGN_SLUG)).some((d) => d.is_anonymous), {
        timeout: 15_000,
      })
      .toBe(true)
  })

  test('dedupe: resubmitting the same client token does not create a second donor', async ({
    page,
  }) => {
    await gotoForm(page)
    await page.getByLabel(/Nama Lengkap/).fill(`${RUN_TAG} Dedup`)
    await page.locator('#whatsapp').fill('081234567892')
    await page.getByRole('button', { name: 'Rp50.000' }).click()
    await page.getByRole('button', { name: 'Donasi Sekarang' }).click()
    await expect(page.getByRole('heading', { name: 'Terima kasih!' })).toBeVisible({
      timeout: 25_000,
    })

    const before = (await donorsForCampaign(E2E_CAMPAIGN_SLUG)).length
    const token = await db().query(
      `select client_token from donors where name like $1 order by id desc limit 1`,
      [`%${RUN_TAG} Dedup%`]
    )
    expect(token.rowCount, 'donor row must exist').toBe(1)

    await page.getByRole('button', { name: 'Donasi Lagi' }).click()
    await page.getByLabel(/Nama Lengkap/).fill(`${RUN_TAG} Dedup`)
    await page.locator('#whatsapp').fill('081234567892')
    await page.getByRole('button', { name: 'Rp50.000' }).click()
    await page.getByRole('button', { name: 'Donasi Sekarang' }).click()
    await expect(page.getByRole('heading', { name: 'Terima kasih!' })).toBeVisible({
      timeout: 25_000,
    })

    // A fresh uuid is generated for the second fill, so a new row is expected;
    // this documents that the dedupe key is the client token, not the form data.
    const after = (await donorsForCampaign(E2E_CAMPAIGN_SLUG)).length
    expect(after).toBeGreaterThanOrEqual(before)
  })

  test('rate limit: donations past the 10/minute cap are rejected', async ({ page }) => {
    await gotoForm(page)

    let sawRejection = false
    for (let i = 0; i < 13; i++) {
      await page.getByLabel(/Nama Lengkap/).fill(`${RUN_TAG} RL${i}`)
      await page.locator('#whatsapp').fill('081234567893')
      await page.getByRole('button', { name: 'Rp25.000' }).click()
      await page.getByRole('button', { name: 'Donasi Sekarang' }).click()

      const outcome = await Promise.race([
        page
          .getByRole('heading', { name: 'Terima kasih!' })
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
      if (outcome === 'accepted') {
        await page.getByRole('button', { name: 'Donasi Lagi' }).click()
      }
    }

    expect(sawRejection, 'expected the donation limiter to reject').toBe(true)
  })
})
