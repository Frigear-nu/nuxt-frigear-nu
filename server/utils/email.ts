import type { H3Event } from 'h3'
import { type ExtractComponentProps, type Options, render } from '@vue-email/render'
import type { Component } from 'vue'

export type BaseEmail = {
  to: string | string[]
  from: string
  subject: string
  replyTo?: string
}

// required either HTML or text, but supports both.
export type EmailMessage
  = | (BaseEmail & { html: string, text?: string })
    | (BaseEmail & { html?: string, text: string })

export const sendEmail = async (event: H3Event, message: EmailMessage) => {
  assertResendApiKey(event)
  assertFromTo(message)
  assertMessage(message)

  const { emails } = useResend()
  const { error } = await emails.send({
    from: message.from,
    to: message.to,
    subject: message.subject,
    html: message.html as string,
    text: message.text as string,
    reply_to: message.replyTo,
  })

  if (error) {
    throw createError({ statusCode: 502, message: error.message ?? 'Error sending email' })
  }
}

export type EmailComponentMessage<T extends Component> = Omit<EmailMessage, 'html'> & {
  component: T
  props?: ExtractComponentProps<T>
}

export const sendEmailTemplate = async <T extends Component>(
  event: H3Event,
  message: EmailComponentMessage<T>,
  options?: Omit<Options, 'plainText'>,
) => {
  const { component, props, ...envelope } = message
  await sendEmail(event, {
    ...envelope,
    html: await render(component, props, options),
    text: await render(component, props, { ...options, plainText: true }),
  })
}

// Guards
const assertResendApiKey = (event: H3Event) => {
  const { resend: { apiKey } } = useRuntimeConfig(event)

  if (!apiKey) {
    throw createError({ statusCode: 500, message: 'Missing API-Key.' })
  }
}

const assertFromTo = (message: Pick<EmailMessage, 'from' | 'to'>) => {
  if (!message.from || !message.to) {
    throw createError({ statusCode: 500, message: 'Missing from or to address.' })
  }
}

const assertMessage = (message: Pick<EmailMessage, 'text' | 'html'>) => {
  if (!message.html && !message.text) {
    throw createError({ statusCode: 500, message: 'Missing HTML or text body.' })
  }
}
