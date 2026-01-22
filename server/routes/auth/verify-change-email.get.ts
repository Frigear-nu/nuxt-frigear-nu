import { useValidatedQuery } from 'h3-zod'
import { verifyChangeEmailSchema } from '#shared/schema/user'
import { ServerError, UnauthorizedError } from '@nitrotool/errors'
import { eq } from 'drizzle-orm'
import EmailAddressChangedEmail from '#shared/emails/auth/EmailAddressChangedEmail.vue'
import { withQuery } from 'ufo'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const { mail: { from, to: replyTo } } = useRuntimeConfig(event)
  const { user } = await getUserSession(event)

  if (!user) {
    return 'You must visit this url from the same browser you requested it.'
  }

  const { token } = await useValidatedQuery(event, verifyChangeEmailSchema)

  const { sub: userId, newMail } = await useValidatedJwt(token, z.object({
    sub: z.coerce.number().int().positive(),
    newMail: z.string().email(),
  }))

  if (Number(userId) !== user.id) {
    throw UnauthorizedError('The change token is personal and cannot be used on behalf of other users.')
  }

  const [updatedUser] = await db.update(schema.users)
    .set({ email: newMail })
    .where(eq(schema.users.id, user.id))
    .returning()

  if (!updatedUser) throw ServerError('Could not update user.')

  // Valid for 1h so that even if someone changes password it can be reverted from the original email.
  // This might not be desirable tbf
  const revertToken = await encodeJwt({ sub: String(user.id), oldEmail: user.email }, 60 * 60)
  const revertUrl = withBaseUrl(withQuery('/auth/revert-email-change', { token: revertToken }))

  if (import.meta.dev) {
    console.log(
      `Revert the change using this URL: ${revertUrl}`,
    )
  }
  else {
    await sendEmailTemplate(event, {
      from,
      to: user.email,
      replyTo,
      subject: 'Your email address has been changed',
      component: EmailAddressChangedEmail,
      props: {
        accountSettingsUrl: withBaseUrl('/account'),
        revertUrl,
      },
    })
  }

  return authenticateUser(event, updatedUser, '/account')
})
