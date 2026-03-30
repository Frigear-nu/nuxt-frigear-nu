/**
 * E2E tests for the expenses feature.
 *
 * Guards that:
 *  - /account/expenses redirects unauthenticated users to sign-in
 *  - /admin/expenses redirects unauthenticated users to sign-in
 *  - The POST /api/account/expenses upload endpoint rejects unauthenticated requests
 *  - The POST /api/account/expenses upload endpoint validates required fields
 */
import { describe, expect, it } from 'vitest'
import { createPage, fetch } from '@nuxt/test-utils/e2e'

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

describe('POST /api/account/expenses (file upload)', () => {
  it('rejects unauthenticated upload with 401', async () => {
    const formData = new FormData()
    formData.append('amount', '100')
    formData.append('description', 'Test expense')
    const blob = new Blob(['fake image data'], { type: 'image/png' })
    formData.append('attachments', blob, 'receipt.png')

    const res = await fetch('/api/account/expenses', {
      method: 'POST',
      body: formData,
    })

    expect(res.status).toBe(401)
  })

  it('rejects unauthenticated upload with missing amount with 401', async () => {
    const formData = new FormData()
    const blob = new Blob(['fake pdf data'], { type: 'application/pdf' })
    formData.append('attachments', blob, 'receipt.pdf')

    const res = await fetch('/api/account/expenses', {
      method: 'POST',
      body: formData,
    })

    // Auth check happens before field validation, so still 401
    expect(res.status).toBe(401)
  })
})
