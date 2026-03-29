/**
 * E2E tests for the admin area.
 *
 * Covers:
 * - Auth guard: unauthorized access to /admin throws a 403 error and does NOT
 *   redirect, per the canViewAdminArea ability in shared/abilities/admin/index.ts.
 * - Admin users page: only accessible for users with the 'admin' role
 *   (canListUsers ability in shared/abilities/admin/users.ts).
 */
import { describe, expect, it } from 'vitest'
import { createPage } from '@nuxt/test-utils/e2e'

describe('Admin area (/admin) — canViewAdminArea guard', () => {
  it('shows a 403 error for unauthenticated users (does not redirect to /sign-in)', async () => {
    const page = await createPage('/admin')
    await page.waitForLoadState('networkidle')
    expect(page.url()).not.toContain('/sign-in')
    const bodyText = await page.textContent('body')
    expect(bodyText).toContain('403')
    await page.close()
  })

  it('stays on the /admin URL and does not redirect away', async () => {
    const page = await createPage('/admin')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/admin')
    await page.close()
  })
})

describe('Admin users page (/admin/users) — admin role required', () => {
  it('shows a 403 error for unauthenticated users', async () => {
    const page = await createPage('/admin/users')
    await page.waitForLoadState('networkidle')
    const bodyText = await page.textContent('body')
    expect(bodyText).toContain('403')
    await page.close()
  })

  it('does not redirect unauthenticated users to /sign-in', async () => {
    const page = await createPage('/admin/users')
    await page.waitForLoadState('networkidle')
    expect(page.url()).not.toContain('/sign-in')
    await page.close()
  })
})
