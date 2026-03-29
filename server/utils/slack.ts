export interface SlackTextMessage {
  text: string
}

export interface SlackBlockMessage {
  blocks: SlackBlock[]
  text?: string
}

export interface SlackBlock {
  type: string
  text?: {
    type: string
    text: string
    emoji?: boolean
  }
  fields?: Array<{
    type: string
    text: string
  }>
}

export type SlackMessage = SlackTextMessage | SlackBlockMessage

export const postToSlack = async (webhookUrl: string, message: SlackMessage): Promise<void> => {
  try {
    await $fetch(webhookUrl, {
      method: 'POST',
      body: message,
    })
  }
  catch (err) {
    console.error('[slack] Failed to post to Slack webhook:', err)
  }
}
