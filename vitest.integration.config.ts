import { defineConfig } from 'vitest/config'
import path from 'node:path'

/**
 * Integration tests. These talk to a REAL running server and/or a REAL
 * database, so they are excluded from the default (unit) run and executed
 * explicitly: `npx vitest run --config vitest.integration.config.ts`.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    setupFiles: ['tests/integration/setup.ts'],
    testTimeout: 60000,
    hookTimeout: 60000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@payload-config': path.resolve(__dirname, './src/payload.config.ts'),
    },
  },
})
