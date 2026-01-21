import { useValidatedBody } from 'h3-zod'
import { resetPasswordSchema } from '#shared/schema/auth'
import { and, eq, gt, isNull } from 'drizzle-orm'
import { NotFoundError, ServerError } from '@nitrotool/errors'

export default defineEventHandler(async (event) => {
  // note: the schema handles confirmPassword
  const { token, password } = await useValidatedBody(event, resetPasswordSchema)

  console.log({ token, password })
  const [passwordReset] = await db.select()
    .from(schema.passwordResets)
    .where(
      and(
        isNull(schema.passwordResets.usedAt),
        gt(schema.passwordResets.expiresAt, new Date()),
        eq(schema.passwordResets.token, token),
      ),
    )

  console.log({ passwordReset })
  if (!passwordReset) throw NotFoundError()

  let user = await findUserById(passwordReset.userId)

  if (!user) throw NotFoundError()

  // ensure the user is migrated
  await createStripeCustomerFromMigration(user)

  await db.update(schema.users).set({
    passwordHash: await hashPassword(password),
  })

  user = await findUserById(passwordReset.userId)

  if (!user) throw ServerError()

  return authenticateUser(event, user)
})
