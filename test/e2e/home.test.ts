import { fileURLToPath } from 'node:url'
import { setup, $fetch, createPage } from '@nuxt/test-utils/e2e'
import { describe, it, expect } from 'vitest'

await setup({
  rootDir: fileURLToPath(new URL('../..', import.meta.url)),
  browser: true,
})

describe('routing', () => {
  it('home page loads', async () => {
    const html = await $fetch('/')
    expect(html).toBeTruthy()
  })

  it('allows navigating to sign-in page', async () => {
    const page = await createPage('/sign-in')
    expect(page.url()).toContain('/sign-in')
    await page.close()
  })

  it('sign-in page renders login form', async () => {
    const page = await createPage('/sign-in')
    await expect(page.locator('body')).toContainText('Log ind')
    await page.close()
  })
})
