import { setup, createPage } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

await setup({
  browser: true,
})

describe('home page', () => {
  it('has title "Hjem" on the Danish home page', async () => {
    const page = await createPage('/')
    const title = await page.title()
    expect(title).toContain('Hjem')
  })

  it('has title "Home" on the English home page', async () => {
    const page = await createPage('/en/')
    const title = await page.title()
    expect(title).toContain('Home')
  })
})
