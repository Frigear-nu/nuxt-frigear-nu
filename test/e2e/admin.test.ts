/**
 * E2E tests for the admin area.
 *
 * Covers:
 * - Auth guard: unauthorized access to /admin redirects to /sign-in.
 * - Admin users page: only accessible for users with the 'admin' role
 *   (canListUsers ability in shared/abilities/admin/users.ts).
 */
import { describe, expect, it } from 'vitest'
import { createPage } from '@nuxt/test-utils/e2e'

describe('Admin area (/admin) — canViewAdminArea guard', () => {
  it('redirects unauthenticated users to /sign-in', async () => {
    const page = await createPage('/admin')
    await page.waitForURL(/\/sign-in/)
    expect(page.url()).toContain('/sign-in')
    await page.close()
  })

  it('includes the original path as a redirect query parameter', async () => {
    const page = await createPage('/admin')
    await page.waitForURL(/\/sign-in/)
    expect(page.url()).toContain('redirect=%2Fadmin')
    await page.close()
  })
})

describe('Admin users page (/admin/users) — admin role required', () => {
  it('redirects unauthenticated users to /sign-in', async () => {
    const page = await createPage('/admin/users')
    await page.waitForURL(/\/sign-in/)
    expect(page.url()).toContain('/sign-in')
    await page.close()
  })

  it('includes the original path as a redirect query parameter', async () => {
    const page = await createPage('/admin/users')
    await page.waitForURL(/\/sign-in/)
    expect(page.url()).toContain('redirect=%2Fadmin%2Fusers')
    await page.close()
  })
})
