import { useValidatedBody } from 'h3-zod'
import { forgotPasswordSchema } from '#shared/schema/auth'
import { ServerError } from '@nitrotool/errors'
import { addMinutes } from 'date-fns'
import PasswordResetEmail from '#shared/emails/auth/PasswordResetEmail.vue'
import { withQuery } from 'ufo'

export default defineEventHandler(async (event) => {
  const { mail: { from, to: replyTo } } = useRuntimeConfig(event)
  const { email } = await useValidatedBody(event, forgotPasswordSchema)

  const user = await findUserByEmail(email)

  if (!user) {
    // We don't want to let any attacker know this is not a valid email.
    return { ok: true }
  }

  const token = createSafeId()
  const expiresAt = addMinutes(new Date(), 30)
  const [createdReset] = await db.insert(schema.passwordResets)
    .values({
      token,
      expiresAt,
      userId: user.id,

    })
    .returning()

  if (!createdReset) throw ServerError('errors.auth.forgotPassword.failed')
  const resetUrl = withBaseUrl(withQuery('/auth/reset-password', { token }))

  if (import.meta.dev) {
    console.log(`Reset password with this URL: ${resetUrl}`)
    return {
      ok: true,
      expiresAt,
      local: true,
    }
  }

  await sendEmailTemplate(event, {
    to: user.email,
    from,
    replyTo,
    subject: 'Password Reset',
    component: PasswordResetEmail,
    props: {
      resetUrl,
    },
  })

  return { ok: true }
})
