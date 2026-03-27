import { fileURLToPath } from 'node:url'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import { describe, it, expect } from 'vitest'

await setup({
  rootDir: fileURLToPath(new URL('../..', import.meta.url)),
  // Disable sourcemaps to avoid a Rollup "conflicting sourcemap source" error
  // that occurs during the Nitro server build in CI.
  nuxtConfig: {
    sourcemap: false,
  },
})

describe('routing', () => {
  it('home page loads', async () => {
    const html = await $fetch('/')
    expect(html).toBeTruthy()
  })

  it('sign-in page loads', async () => {
    const html = await $fetch('/sign-in')
    expect(html).toBeTruthy()
  })

  it('sign-in page renders login form', async () => {
    const html = await $fetch('/sign-in')
    expect(html).toContain('Log ind')
  })
})
