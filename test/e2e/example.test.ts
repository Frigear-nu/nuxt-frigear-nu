import { describe, expect, it } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils/e2e'
import { fileURLToPath } from 'node:url'

describe('page /', async () => {
  await setup({
    browser: true,
    build: true,
    rootDir: fileURLToPath(new URL('../../', import.meta.url)),
  })

  it('displays the correct title', async () => {
    const page = await createPage('/')
    expect(await page.title()).toMatchInlineSnapshot('Hjem - Frigear.nu')

    await page.close()
  })
})
