import { createTest, exposeContextToEnv } from '@nuxt/test-utils/e2e'

/**
 * Vitest project-level globalSetup for e2e tests.
 *
 * Builds and starts a single Nuxt server that is shared across all e2e test
 * files, preventing concurrent SQLite access ("database is locked" errors).
 *
 * The server URL and options are serialised into `NUXT_TEST_CONTEXT` via
 * `exposeContextToEnv()` and recovered in each worker fork automatically
 * when `useTestContext()` is first called (e.g. inside `createPage()`).
 *
 * See: @nuxt/test-utils dist/runtime/global-setup.mjs for the upstream
 * reference implementation that this mirrors.
 */
const hooks = createTest({ setupTimeout: 300_000 })

export const setup = async () => {
  await hooks.beforeAll()
  exposeContextToEnv()
}

export const teardown = async () => {
  await hooks.afterAll()
}
