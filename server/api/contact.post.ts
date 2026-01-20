import { contactFormSchema, contactSubjectLabels } from '#shared/schema/forms/contact'
import escapeHtml from 'escape-html'

export default defineEventHandler(async (event) => {
  const { mail: { to, from } } = useRuntimeConfig(event)

  const data = await readValidatedBody(event, d => contactFormSchema.parse(d))

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
    ${data.phone ? `<p><strong>Telefon:</strong> ${escapeHtml(data?.phonePrefix || '')} ${escapeHtml(data.phone ?? '')}</p>` : ''}
    <p><strong>Emne:</strong> ${escapeHtml(safeSubject)}</p>
    <pre style="white-space:pre-wrap">${escapeHtml(data.message)}</pre>
  `.trim()

  await sendEmail(event, {
    to,
    from,
    subject: safeSubject,
    html,
    replyTo: data.email,
  })

  return { ok: true }
})
