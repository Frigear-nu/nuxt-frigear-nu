import { expect, test } from '@nuxt/test-utils/playwright'

test('homepage title', async ({ page, goto }) => {
  await goto('/', { waitUntil: 'hydration' })

  expect(await page.title()).toEqual('Hjem - Frigear.nu')
  await goto('/en', { waitUntil: 'hydration' })
  expect(await page.title()).toEqual('Home - Frigear.nu')
})
