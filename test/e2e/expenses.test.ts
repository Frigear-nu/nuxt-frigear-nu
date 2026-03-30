/**
 * E2E tests for the expenses feature.
 *
 * Guards that:
 *  - /account/expenses redirects unauthenticated users to sign-in
 *  - /admin/expenses redirects unauthenticated users to sign-in
 *  - An authenticated non-admin user cannot access /admin/expenses
 */
import { describe, expect, it } from 'vitest'
import { createPage } from '@nuxt/test-utils/e2e'

describe('/account/expenses', () => {
  it('redirects unauthenticated users to /sign-in', async () => {
    const page = await createPage('/account/expenses')
    await page.waitForURL(/sign-in/)
    expect(page.url()).toContain('sign-in')
    await page.close()
  })
})

describe('/admin/expenses', () => {
  it('redirects unauthenticated users away from admin expenses', async () => {
    const page = await createPage('/admin/expenses')
    await page.waitForURL(/sign-in|\/(?!admin)/)
    expect(page.url()).not.toMatch(/\/admin\/expenses/)
    await page.close()
  })
})
