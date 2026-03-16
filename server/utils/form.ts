import type { H3Event } from 'h3'

export const dispatchFormEmailDelivery = (event: H3Event, form: '') => {
  const { mail: { from, to: defaultToEmail } } = useRuntimeConfig(event)
  return sendEmail(event, {
    from,
    to: destinations,
    subject: `New submission in ${form.title}`,
    text: JSON.stringify(payload),
  })
}
