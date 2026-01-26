import { contactFormSchema, contactSubjectLabels } from '#shared/schema/forms/contact'
import { useValidatedBody } from 'h3-zod'
import ContactEmail from '#shared/emails/forms/ContactEmail.vue'

export default defineEventHandler(async (event) => {
  const { mail: { to: defaultTo, from }, contact } = useRuntimeConfig(event)

  const data = await useValidatedBody(event, contactFormSchema)

  const subjectLabel = contactSubjectLabels[data.subject as keyof typeof contactSubjectLabels]

  const subject
    = data.subject === 'other' && data.subjectOther?.trim()
      ? `${subjectLabel}: ${data.subjectOther.trim().substring(0, 20)}`
      : subjectLabel

  const to = (contact[data.subject as string] || defaultTo) as string

  await sendEmailTemplate(event, {
    to,
    from,
    subject,
    replyTo: data.email,
    component: ContactEmail,
    props: {
      form: data,
    },
  })

  return { ok: true }
})
