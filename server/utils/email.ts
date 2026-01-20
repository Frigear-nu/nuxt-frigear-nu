import type { H3Event } from 'h3'

type Email = {
  to: string
  from: string
  subject: string
  replyTo?: string
  html: string
}

export const sendEmail = async (event: H3Event, message: Email) => {
  const { resend: { apiKey } } = useRuntimeConfig(event)

  if (!apiKey) {
    throw createError({ statusCode: 500, message: 'Missing API-Key.' })
  }

  if (!message.from || !message.to) {
    throw createError({ statusCode: 500, message: 'Missing from or to address.' })
  }

  const { emails } = useResend()
  const { error } = await emails.send({
    from: message.from,
    to: [message.to],
    subject: message.subject,
    html: message.html,
    // Resend’s Node SDK uses replyTo (camelCase) - but the API expects reply_to (snake_case) and it works. - DONT CHANGE
    reply_to: message.replyTo,
  })

  if (error) {
    throw createError({ statusCode: 502, message: error.message ?? 'Error sending email' })
  }
}
