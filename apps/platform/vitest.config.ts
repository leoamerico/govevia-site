import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@govevia/org-profile': resolve(__dirname, '../../packages/org-profile/src/index.ts'),
    },
  },
  test: {
    globals: true,
    testTimeout: 10_000,
  },
})
