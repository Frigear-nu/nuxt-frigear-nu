import { contactFormSchema, contactSubjectLabels } from '#shared/schema/forms/contact'
import { useValidatedBody } from 'h3-zod'
import ContactEmail from '#shared/emails/forms/ContactEmail.vue'

export default defineEventHandler(async (event) => {
  const { mail: { to, from } } = useRuntimeConfig(event)

  const data = await useValidatedBody(event, contactFormSchema)

  const subjectLabel = contactSubjectLabels[data.subject as keyof typeof contactSubjectLabels]

  const subject
    = data.subject === 'other' && data.subjectOther?.trim()
      ? `${subjectLabel}: ${data.subjectOther.trim().substring(0, 20)}`
      : subjectLabel

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
