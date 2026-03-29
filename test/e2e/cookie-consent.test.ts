import { createPage } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

describe('Cookie consent banner', () => {
  it('shows the consent banner on first visit (no cookie set)', async () => {
    const page = await createPage('/')
    // The slideover panel slides up from the bottom
    const banner = page.locator('[data-testid="cookie-consent-banner"]')
    await banner.waitFor({ state: 'visible' })
    expect(await banner.isVisible()).toBe(true)
    await page.close()
  })

  it('displays Accept and Reject buttons', async () => {
    const page = await createPage('/')
    const banner = page.locator('[data-testid="cookie-consent-banner"]')
    await banner.waitFor({ state: 'visible' })

    const acceptBtn = page.getByRole('button', { name: /accept/i })
    const rejectBtn = page.getByRole('button', { name: /reject/i })

    expect(await acceptBtn.isVisible()).toBe(true)
    expect(await rejectBtn.isVisible()).toBe(true)
    await page.close()
  })

  it('hides the banner after clicking Accept', async () => {
    const page = await createPage('/')
    const banner = page.locator('[data-testid="cookie-consent-banner"]')
    await banner.waitFor({ state: 'visible' })

    await page.getByRole('button', { name: /accept/i }).click()
    await banner.waitFor({ state: 'hidden' })
    expect(await banner.isVisible()).toBe(false)
    await page.close()
  })

  it('hides the banner after clicking Reject', async () => {
    const page = await createPage('/')
    const banner = page.locator('[data-testid="cookie-consent-banner"]')
    await banner.waitFor({ state: 'visible' })

    await page.getByRole('button', { name: /reject/i }).click()
    await banner.waitFor({ state: 'hidden' })
    expect(await banner.isVisible()).toBe(false)
    await page.close()
  })

  it('does not show the banner when cookie-consent=accepted is already set', async () => {
    const page = await createPage('/')
    // Simulate a returning visitor by setting the consent cookie before loading
    await page.context().addCookies([
      { name: 'cookie-consent', value: 'accepted', url: page.url() },
    ])
    await page.reload()
    const banner = page.locator('[data-testid="cookie-consent-banner"]')
    await banner.waitFor({ state: 'hidden', timeout: 2000 })
    expect(await banner.isVisible()).toBe(false)
    await page.close()
  })

  it('does not show the banner when cookie-consent=rejected is already set', async () => {
    const page = await createPage('/')
    await page.context().addCookies([
      { name: 'cookie-consent', value: 'rejected', url: page.url() },
    ])
    await page.reload()
    const banner = page.locator('[data-testid="cookie-consent-banner"]')
    await banner.waitFor({ state: 'hidden', timeout: 2000 })
    expect(await banner.isVisible()).toBe(false)
    await page.close()
  })
})
