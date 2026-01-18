import { createContactFormSchema } from '#shared/forms/contact/schema'
import { contactSubjectLabels } from '#shared/forms/contact/subjects'
import escapeHtml from 'escape-html'

export default defineEventHandler(async (event) => {
  const { emails } = useResend()
  const { from, to } = useRuntimeConfig().resend
  const schema = createContactFormSchema()
  const data = await readValidatedBody(event, d => schema.parse(d))

  if (!from || !to) {
    throw createError({ statusCode: 500, message: 'Missing from or to address.' })
  }

  const subjectLabel = contactSubjectLabels[data.subject]

  const subjectLine
    = data.subject === 'other' && data.subjectOther?.trim()
      ? `${subjectLabel}: ${data.subjectOther.trim()}`
      : subjectLabel
  const safeSubject = subjectLine.replace(/[\r\n]+/g, ' ').trim()

  const html = `
    <h2>Ny besked fra kontaktformular</h2>
    <p><strong>Navn:</strong> ${escapeHtml(data.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
    <p><strong>Telefon:</strong> ${escapeHtml(data.phone ?? '')}</p>
    <p><strong>Emne:</strong> ${escapeHtml(safeSubject)}</p>
    <pre style="white-space:pre-wrap">${escapeHtml(data.message)}</pre>
  `.trim()

  const response = await emails.send({
    from,
    to: [to],
    subject: safeSubject,
    html,
    // Resend’s Node SDK uses replyTo (camelCase) - but the API expects reply_to (snake_case) and it works. - DONT CHANGE TO replyTo
    reply_to: data.email,
  })

  if (response.error) {
    throw createError({ statusCode: 502, message: response.error.message ?? 'Error sending email' })
  }

  return { ok: true }
})
