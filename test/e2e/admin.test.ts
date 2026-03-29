/**
 * E2E tests for the admin area.
 *
 * Covers:
 * - Auth guard: unauthenticated users are redirected to /sign-in for all
 *   protected admin routes.
 * - Admin users page: the page redirects with the correct `redirect` query
 *   param so the user can be returned after sign-in.
 */
import { describe, expect, it } from 'vitest'
import { createPage } from '@nuxt/test-utils/e2e'

describe('Admin area auth guard', () => {
  it('redirects unauthenticated users from /admin to /sign-in', async () => {
    const page = await createPage('/admin')
    await page.waitForURL(/\/sign-in/)
    expect(page.url()).toContain('/sign-in')
    await page.close()
  })

  it('includes a redirect query param pointing back to /admin', async () => {
    const page = await createPage('/admin')
    await page.waitForURL(/\/sign-in/)
    expect(page.url()).toContain('redirect=')
    expect(decodeURIComponent(page.url())).toContain('/admin')
    await page.close()
  })

  it('redirects unauthenticated users from /admin/users to /sign-in', async () => {
    const page = await createPage('/admin/users')
    await page.waitForURL(/\/sign-in/)
    expect(page.url()).toContain('/sign-in')
    await page.close()
  })
})

describe('Admin users page', () => {
  it('redirects to /sign-in with redirect param pointing to /admin/users when unauthenticated', async () => {
    const page = await createPage('/admin/users')
    await page.waitForURL(/\/sign-in/)
    const url = decodeURIComponent(page.url())
    expect(url).toContain('/sign-in')
    expect(url).toContain('/admin/users')
    await page.close()
  })

  it('shows the sign-in form after redirect', async () => {
    const page = await createPage('/admin/users')
    await page.waitForURL(/\/sign-in/)
    const emailInput = page.locator('input[autocomplete="email"]')
    await emailInput.waitFor()
    expect(await emailInput.getAttribute('type')).toBe('email')
    await page.close()
  })
})
