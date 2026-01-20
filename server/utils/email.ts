import type { H3Event } from 'h3'
import type { EmailTemplateName, EmailTemplateProps } from '#build/types/email-templates.generated'

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

export type EmailTemplateMessage<T extends EmailTemplateName = EmailTemplateName>
  = Omit<EmailMessage, 'html'> & { template: T, props?: EmailTemplateProps[T] }

export const sendEmailTemplate = async <T extends EmailTemplateName>(
  event: H3Event,
  envelope: EmailTemplateMessage<T>,
) => {
  assertResendApiKey(event)
  assertFromTo(envelope)
  const { emails } = useResend()

  const { error } = await emails.send({
    from: envelope.from,
    to: envelope.to,
    subject: envelope.subject,
    reply_to: envelope.replyTo,
    html: await renderEmailComponent(envelope.template, envelope.props),
    text: await renderEmailComponent(envelope.template, envelope.props, { plainText: true }),
  })

  if (error) throw createError({ statusCode: 502, message: error.message ?? 'Error sending email' })
}
