import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/integration/**', 'node_modules/**'],
    testTimeout: 60000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/features/**', 'src/access/**', 'src/lib/**'],
      exclude: ['**/*.d.ts'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@payload-config': path.resolve(__dirname, './src/payload.config.ts'),
    },
  },
})
