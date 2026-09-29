import { defineConfig, devices } from '@playwright/test'

/**
 * E2E config — real Chromium against the local dev server + the existing
 * Supabase database.
 *
 * Safety rules baked in (see E2E-NOTEPAD.md):
 *  - Tests write only a handful of rows per run, each tagged with an
 *    "E2E-TEST-<timestamp>" marker and deleted again in afterAll.
 *  - The app rate limiter stays ON (it is itself under test) and doubles as a
 *    guard against accidental request floods.
 *
 * CI is not wired up yet on purpose; run locally with `npm run test:e2e`.
 */
export default defineConfig({
  testDir: './e2e',
  // The dev server compiles routes on first hit, so allow a generous budget
  // per test and do not run specs in parallel against one dev server.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { outputFolder: 'e2e-report', open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    locale: 'id-ID',
    timezoneId: 'Asia/Jakarta',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Reuse a running dev server if present; otherwise start one.
  webServer: process.env.E2E_NO_SERVER
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000/api/health',
        reuseExistingServer: true,
        timeout: 120_000,
        stdout: 'ignore',
        stderr: 'pipe',
      },
})
