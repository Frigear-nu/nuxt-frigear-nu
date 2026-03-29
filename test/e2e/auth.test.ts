/**
 * E2E tests for the sign-in and sign-up form fields.
 *
 * These tests guard against regressions such as the email input on the sign-up
 * page being rendered as a password field (masked) due to SSR/hydration
 * mismatches. See: https://github.com/Frigear-nu/nuxt-frigear-nu/issues/481
 */
import { describe, expect, it } from 'vitest'
import { createPage } from '@nuxt/test-utils/e2e'

describe('Sign In page (/sign-in)', () => {
  it('renders the email input with type="email"', async () => {
    const page = await createPage('/sign-in')
    const emailInput = page.locator('input[autocomplete="email"]')
    await emailInput.waitFor()
    expect(await emailInput.getAttribute('type')).toBe('email')
    await page.close()
  })

  it('renders the password input with type="password"', async () => {
    const page = await createPage('/sign-in')
    const passwordInput = page.locator('input[autocomplete="password"]')
    await passwordInput.waitFor()
    expect(await passwordInput.getAttribute('type')).toBe('password')
    await page.close()
  })

  it('does not render a name input (sign-in only has email + password)', async () => {
    const page = await createPage('/sign-in')
    // Wait for the form to be ready
    await page.locator('input[autocomplete="email"]').waitFor()
    const nameInput = page.locator('input[autocomplete="name"]')
    expect(await nameInput.count()).toBe(0)
    await page.close()
  })
})

describe('Sign Up page (/sign-up)', () => {
  it('renders the name input with type="text"', async () => {
    const page = await createPage('/sign-up')
    const nameInput = page.locator('input[autocomplete="name"]')
    await nameInput.waitFor()
    expect(await nameInput.getAttribute('type')).toBe('text')
    await page.close()
  })

  it('renders the email input with type="email" (regression: must not be type="password")', async () => {
    const page = await createPage('/sign-up')
    const emailInput = page.locator('input[autocomplete="email"]')
    await emailInput.waitFor()
    const inputType = await emailInput.getAttribute('type')
    // Critical regression guard: the email field must never be rendered as a password field
    expect(inputType).toBe('email')
    expect(inputType).not.toBe('password')
    await page.close()
  })

  it('renders the password input with type="password"', async () => {
    const page = await createPage('/sign-up')
    const passwordInput = page.locator('input[autocomplete="password"]')
    await passwordInput.waitFor()
    expect(await passwordInput.getAttribute('type')).toBe('password')
    await page.close()
  })

  it('renders fields in the correct order: name, email, password', async () => {
    const page = await createPage('/sign-up')
    await page.locator('input[autocomplete="name"]').waitFor()

    // Collect all three form inputs in DOM order
    const inputs = page.locator(
      'input[autocomplete="name"], input[autocomplete="email"], input[autocomplete="password"]',
    )
    const allInputs = await inputs.all()

    expect(allInputs).toHaveLength(3)
    expect(await allInputs[0]!.getAttribute('autocomplete')).toBe('name')
    expect(await allInputs[1]!.getAttribute('autocomplete')).toBe('email')
    expect(await allInputs[2]!.getAttribute('autocomplete')).toBe('password')
    await page.close()
  })
})
