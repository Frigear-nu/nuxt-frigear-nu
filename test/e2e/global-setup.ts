import { execSync } from 'node:child_process'
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
  // Apply database migrations after the build so that tables created by
  // custom migrations are available during e2e tests.  The NuxtHub module
  // copies migration files to .data/hub/db/migrations/ during the build but
  // intentionally skips applying them (applyMigrationsDuringBuild: false) to
  // avoid an @nuxt/content integrity-check conflict.  Running the CLI command
  // here applies any pending migrations to the local SQLite database before
  // tests start.
  try {
    execSync('pnpm db:migrate', { stdio: 'inherit' })
  }
  catch (error) {
    throw new Error(`Failed to apply database migrations before e2e tests: ${error instanceof Error ? error.message : error}`)
  }
  exposeContextToEnv()
}

export const teardown = async () => {
  await hooks.afterAll()
}
