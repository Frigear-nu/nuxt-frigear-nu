import { afterAll, beforeAll } from 'vitest'
import { createBrowser, useTestContext } from '@nuxt/test-utils/e2e'

/**
 * Per-file browser lifecycle for e2e tests (runs via setupFiles).
 *
 * The Nuxt server is already running (started by global-setup.ts).
 * `useTestContext()` → `recoverContextFromEnv()` recovers the server URL
 * from `NUXT_TEST_CONTEXT` (set by global-setup via `exposeContextToEnv()`
 * and inherited by each forked worker process).
 *
 * A fresh Playwright browser is launched per test file and torn down after
 * all tests in that file complete.
 */
beforeAll(async () => {
  await createBrowser()
})

afterAll(async () => {
  const ctx = useTestContext()
  if (ctx.browser) {
    await ctx.browser.close()
    ctx.browser = undefined
  }
})
