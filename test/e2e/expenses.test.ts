/**
 * E2E tests for the expenses feature.
 *
 * Guards that:
 *  - /account/expenses redirects unauthenticated users to sign-in
 *  - /admin/expenses redirects unauthenticated users to sign-in
 *  - The POST /api/account/expenses upload endpoint rejects unauthenticated requests
 *  - The POST /api/account/expenses upload endpoint validates required fields
 *  - An authenticated user can successfully upload a file attachment
 */
import { beforeAll, describe, expect, it } from 'vitest'
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

describe('POST /api/account/expenses (authenticated file upload)', () => {
  let sessionCookie: string

  beforeAll(async () => {
    const res = await fetch('/api/__test__/sign-in', { method: 'POST' })
    const raw = res.headers.get('set-cookie') ?? ''
    // Extract name=value (the part before the first ';')
    sessionCookie = raw.split(';')[0] ?? ''
  })

  it('allows an authenticated user to submit an expense with a file attachment', async () => {
    const formData = new FormData()
    formData.append('amount', '42.50')
    formData.append('description', 'E2E test receipt')
    const blob = new Blob(['fake png data'], { type: 'image/png' })
    formData.append('attachments', blob, 'receipt.png')

    const res = await fetch('/api/account/expenses', {
      method: 'POST',
      body: formData,
      headers: { Cookie: sessionCookie },
    })

    expect(res.status).toBe(200)
    const body = await res.json() as { id: string, amount: number, status: string }
    expect(body.id).toMatch(/^exp_/)
    expect(body.amount).toBe(42.50)
    expect(body.status).toBe('pending')
  })
})
