/**
 * E2E tests for the cart i18n feature.
 *
 * CartItem now stores multilingual title/description as Record<string,string>
 * and resolves the correct locale via translatedProperty.
 * The cart also distinguishes item types via the `type` field ('membership' | 'product').
 *
 * Relates to: feat(cart): i18n products
 */
import { createPage } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

/** A minimal multilingual membership cart item stored in localStorage. */
const multilingualCartItem = JSON.stringify([
  {
    id: 'price_test_membership',
    type: 'membership',
    title: { da: 'Månedlig', en: 'Monthly' },
    description: { da: 'Månedligt medlemskab', en: 'Monthly membership' },
    price: 5000,
    qty: 1,
    maxQty: 1,
  },
])

describe('Cart item title resolves per locale', () => {
  it('shows the Danish cart item title on the Danish home page', async () => {
    const page = await createPage('/')

    // Inject a multilingual cart item and open the cart before reloading
    await page.evaluate((cartJson) => {
      localStorage.setItem('cart', cartJson)
      localStorage.setItem('cart-modal-open', 'true')
    }, multilingualCartItem)

    await page.reload()

    // The cart slideover should open automatically because cart-modal-open=true
    const cartTitle = page.locator('text=Månedlig')
    await cartTitle.waitFor({ timeout: 5000 })
    expect(await cartTitle.isVisible()).toBe(true)
    await page.close()
  })

  it('shows the English cart item title on the English home page', async () => {
    const page = await createPage('/en/')

    // Inject a multilingual cart item and open the cart before reloading
    await page.evaluate((cartJson) => {
      localStorage.setItem('cart', cartJson)
      localStorage.setItem('cart-modal-open', 'true')
    }, multilingualCartItem)

    await page.reload()

    // The cart slideover should open automatically because cart-modal-open=true
    const cartTitle = page.locator('text=Monthly')
    await cartTitle.waitFor({ timeout: 5000 })
    expect(await cartTitle.isVisible()).toBe(true)
    await page.close()
  })
})
