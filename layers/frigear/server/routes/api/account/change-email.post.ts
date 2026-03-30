import { useValidatedBody } from 'h3-zod'
import { changeUserEmailSchema } from '#shared/schema/user'
import VerifyEmailAddressEmail from '#shared/emails/auth/VerifyEmailAddressEmail.vue'
import { withQuery } from 'ufo'

export default defineEventHandler(async (event) => {
  const { mail: { from, to: replyTo } } = useRuntimeConfig(event)
  const userId = await requireUserId(event)
  const { email } = await useValidatedBody(event, changeUserEmailSchema)

  // For email changes we sign a JWT for the link valid for 30 min
  const token = await encodeJwt({ sub: String(userId), newMail: email }, 60 * 30)
  const url = withBaseUrl(withQuery('/auth/verify-change-email', { token }))

  if (import.meta.dev) {
    console.log(
      `Verify email change with this URL: ${url}`,
    )
    return { local: true }
  }

  await sendEmailTemplate(event, {
    from,
    to: email,
    replyTo,
    subject: 'Verify email',
    component: VerifyEmailAddressEmail,
    props: {
      url,
      mode: 'verify-change',
    },
  })

  return { ok: true }
})
