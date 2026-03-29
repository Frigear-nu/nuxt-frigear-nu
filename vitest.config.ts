import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    reporters: process.env.GITHUB_ACTIONS
      ? ['verbose', 'github-actions', 'junit']
      : ['verbose'],
    outputFile: {
      junit: './test-results/junit.xml',
    },
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/unit/*.{test,spec}.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'e2e',
          include: ['test/e2e/*.{test,spec}.ts'],
          environment: 'node',
          hookTimeout: 300000,
          // Each test file runs in its own forked process so that
          // process.env.NUXT_TEST_CONTEXT (set by globalSetup via
          // exposeContextToEnv) is inherited and visible to workers.
          pool: 'forks',
          // Start ONE Nuxt server for all e2e test files (prevents
          // concurrent SQLite access / "database is locked" errors).
          globalSetup: ['./test/e2e/global-setup.ts'],
          // Launch a fresh Playwright browser per test file and tear it
          // down after all tests in that file complete.
          setupFiles: ['./test/e2e/setup.ts'],
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/*.{test,spec}.ts'],
          environment: 'nuxt',
        },
      }),
    ],
  },
})
