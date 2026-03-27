import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { postToSlack } from '../../server/utils/slack'

const WEBHOOK_URL = 'https://hooks.slack.com/services/TEST/TEST/TEST'

describe('postToSlack', () => {
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockFetch = vi.fn().mockResolvedValue({})
    vi.stubGlobal('$fetch', mockFetch)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('calls $fetch with the correct URL, method and body', async () => {
    const message = { text: 'hello' }
    await postToSlack(WEBHOOK_URL, message)

    expect(mockFetch).toHaveBeenCalledOnce()
    expect(mockFetch).toHaveBeenCalledWith(WEBHOOK_URL, {
      method: 'POST',
      body: message,
    })
  })

  it('sends a block message correctly', async () => {
    const message = {
      blocks: [{ type: 'section', text: { type: 'mrkdwn', text: 'hello' } }],
      text: 'hello',
    }
    await postToSlack(WEBHOOK_URL, message)

    expect(mockFetch).toHaveBeenCalledWith(WEBHOOK_URL, {
      method: 'POST',
      body: message,
    })
  })

  it('does not throw when $fetch rejects', async () => {
    mockFetch.mockRejectedValue(new Error('network error'))

    await expect(postToSlack(WEBHOOK_URL, { text: 'hello' })).resolves.toBeUndefined()
  })

  it('logs an error to console.error when $fetch rejects', async () => {
    const error = new Error('network error')
    mockFetch.mockRejectedValue(error)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await postToSlack(WEBHOOK_URL, { text: 'hello' })

    expect(consoleSpy).toHaveBeenCalledWith('[slack] Failed to post to Slack webhook:', error)
    consoleSpy.mockRestore()
  })
})
