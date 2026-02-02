import { useValidatedBody } from 'h3-zod'
import { changeUserPasswordSchema } from '#shared/schema/user'
import { eq } from 'drizzle-orm'
import { NotFoundError, ServerError, UnauthorizedError } from '@nitrotool/errors'
import PasswordWasChangedEmail from '#shared/emails/auth/PasswordWasChangedEmail.vue'

export default defineEventHandler(async (event) => {
  const { mail: { from, to: replyTo } } = useRuntimeConfig(event)
  const userId = await requireUserId(event)
  const $t = await useTranslation(event)

  const {
    currentPassword,
    newPassword,
    // confirmNewPassword, // the schema validates this.
  } = await useValidatedBody(event, changeUserPasswordSchema)

  const dbUser = await findUserById(userId)

  if (!dbUser) {
    throw NotFoundError()
  }

  // In case the user does NOT have a password, we allow them to skip this step no matter what they put in the box?
  if (dbUser.passwordHash && !await verifyPassword(dbUser.passwordHash, currentPassword)) {
    throw UnauthorizedError('errors.auth.changePassword.invalidPassword')
  }

  const [updatedUser] = await db.update(schema.users)
    .set({ passwordHash: await hashPassword(newPassword) })
    .where(eq(schema.users.id, dbUser.id))
    .returning()

  if (!updatedUser) throw ServerError()

  if (import.meta.dev) {
    console.log(
      `Password change for ${dbUser.email} was successful.`,
    )

    return authenticateUser(event, updatedUser)
  }

  // FIXME: With #58 and #59
  await sendEmailTemplate(event, {
    from,
    replyTo,
    to: dbUser.email,
    subject: $t('emails.auth.passwordWasChanged.subject', 'Your password was changed'),
    component: PasswordWasChangedEmail,
    props: {
      accountSettingsUrl: withBaseUrl('/account'),
    },
  })

  return authenticateUser(event, updatedUser)
})
