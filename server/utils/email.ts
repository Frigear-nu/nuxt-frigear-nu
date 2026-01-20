import type { H3Event } from 'h3'
import { type ExtractComponentProps, type Options, render } from '@vue-email/render'
import type { Component } from 'vue'

export type EmailMessage = {
  to: string | string[]
  from: string
  subject: string
  replyTo?: string
  html: string
}

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

export const sendEmail = async (event: H3Event, message: EmailMessage) => {
  assertResendApiKey(event)
  assertFromTo(message)

  const { emails } = useResend()
  const { error } = await emails.send({
    from: message.from,
    to: message.to,
    subject: message.subject,
    html: message.html,
    reply_to: message.replyTo,
  })

  if (error) {
    throw createError({ statusCode: 502, message: error.message ?? 'Error sending email' })
  }
}

export type EmailComponentMessage<T extends Component> = Omit<EmailMessage, 'html'> & { component: T, props?: ExtractComponentProps<T> }

export const sendEmailTemplate = async <T extends Component>(
  event: H3Event,
  envelope: EmailComponentMessage<T>,
  options?: Omit<Options, 'plainText'>,
) => {
  assertResendApiKey(event)
  assertFromTo(envelope)
  const { emails } = useResend()

  const { error } = await emails.send({
    from: envelope.from,
    to: envelope.to,
    subject: envelope.subject,
    reply_to: envelope.replyTo,
    html: await render(envelope.component, envelope.props, options),
    text: await render(envelope.component, envelope.props, { ...options, plainText: true }),
  })

  if (error) throw createError({ statusCode: 502, message: error.message ?? 'Error sending email' })
}

// type EmailTemplateMessage = Omit<EmailMessage, 'html'> & {
//   template: string
//   props?: Record<string, unknown>
// }
//
// export const sendEmailTemplate = async (event: H3Event, message: EmailTemplateMessage) => {
//   assertResendApiKey(event)
//   assertFromTo(message)
//
//   const { emails } = useResend()
//   const { error } = await emails.send({
//     from: message.from,
//     to: message.to,
//     subject: message.subject,
//     reply_to: message.replyTo,
//     template: {
//       id: message.template,
//       variables: message.props,
//     },
//   })
//
//   if (error) throw createError({ statusCode: 502, message: error.message ?? 'Error sending email' })
// }
