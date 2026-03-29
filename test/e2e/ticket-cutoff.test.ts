/**
 * E2E tests for the ticket sales cutoff date feature.
 *
 * The General Assembly 2026 event (`content/events/2026/01.general-assembly.yml`)
 * has `end: 2026-03-21 23:00`, which is in the past relative to the current
 * date (2026-03-27). This makes it a perfect real-content fixture for testing
 * that the sales-ended state is rendered correctly in the browser.
 *
 * Tests cover:
 *  - The "sales ended" alert is shown on the ticket card
 *  - The "Go to checkout" button is NOT rendered (sales cutoff prevents it)
 *  - The "Sign in to purchase tickets" button is NOT rendered
 *  - The food addon product group IS visible (it renders independently of cutoff)
 *  - After selecting a food addon, the "sales ended" state is still active and
 *    the checkout button is still absent (the selected-addon stage)
 */
import { createPage } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

// The English-locale event path (the YAML lives at
// content/events/2026/01.general-assembly.yml).
const EVENT_PATH = '/en/events/2026/general-assembly'

describe('ticket cutoff date – event page (EN)', () => {
  it('shows the "sales ended" alert when the cutoff date has passed', async () => {
    const page = await createPage(EVENT_PATH)
    // Wait for the ticket card to hydrate
    const salesEndedAlert = page.getByText('Ticket sales have ended for this event.')
    await salesEndedAlert.waitFor({ timeout: 10_000 })
    expect(await salesEndedAlert.isVisible()).toBe(true)
    await page.close()
  })

  it('does NOT render the "Go to checkout" button when cutoff has passed', async () => {
    const page = await createPage(EVENT_PATH)
    await page.getByText('Ticket sales have ended for this event.').waitFor({ timeout: 10_000 })
    const checkoutBtn = page.getByRole('button', { name: 'Go to checkout' })
    expect(await checkoutBtn.count()).toBe(0)
    await page.close()
  })

  it('does NOT render the "Sign in to purchase tickets" button when cutoff has passed', async () => {
    const page = await createPage(EVENT_PATH)
    await page.getByText('Ticket sales have ended for this event.').waitFor({ timeout: 10_000 })
    const signInBtn = page.getByRole('link', { name: 'Sign in to purchase tickets' })
    expect(await signInBtn.count()).toBe(0)
    await page.close()
  })

  it('still renders the addon product group (pre-select addon stage, cutoff reached)', async () => {
    const page = await createPage(EVENT_PATH)
    // Wait until the ticket card is ready (sales-ended alert is the reliable
    // hydration signal since it is conditionally rendered by Vue after mount).
    await page.getByText('Ticket sales have ended for this event.').waitFor({ timeout: 10_000 })
    // The food-addon radio group should still be visible – its rendering is
    // independent of the cutoff; it only depends on the selected ticket having products.
    const addonLabel = page.getByText('Carnivore')
    expect(await addonLabel.count()).toBeGreaterThan(0)
    await page.close()
  })

  it('keeps the "sales ended" alert after selecting an addon product (selected-addon stage)', async () => {
    const page = await createPage(EVENT_PATH)
    await page.getByText('Ticket sales have ended for this event.').waitFor({ timeout: 10_000 })

    // Click the "Carnivore" radio option to simulate the user selecting an addon
    await page.getByText('Carnivore').first().click()

    // The "sales ended" alert must still be visible after the addon selection
    const salesEndedAlert = page.getByText('Ticket sales have ended for this event.')
    expect(await salesEndedAlert.isVisible()).toBe(true)

    // The checkout button must still NOT be rendered even with an addon selected
    const checkoutBtn = page.getByRole('button', { name: 'Go to checkout' })
    expect(await checkoutBtn.count()).toBe(0)

    await page.close()
  })
})
