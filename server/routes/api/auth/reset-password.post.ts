import { useValidatedBody } from 'h3-zod'
import { resetPasswordSchema } from '#shared/schema/auth'
import { and, eq, gt, isNull } from 'drizzle-orm'
import { NotFoundError, ServerError } from '@nitrotool/errors'

export default defineEventHandler(async (event) => {
  // note: the schema handles confirmPassword
  const { token, password } = await useValidatedBody(event, resetPasswordSchema)

  const [passwordReset] = await db.update(schema.passwordResets)
    .set({ usedAt: new Date() })
    .where(
      and(
        isNull(schema.passwordResets.usedAt),
        gt(schema.passwordResets.expiresAt, new Date()),
        eq(schema.passwordResets.token, token),
      ),
    ).returning()

  if (!passwordReset) throw NotFoundError()

  const user = await findUserById(passwordReset.userId)

  if (!user) throw NotFoundError()

  // ensure the user is migrated
  await ensureStripeCustomer(user)

  const [updatedUser] = await db.update(schema.users)
    .set({
      passwordHash: await hashPassword(password),
    })
    .where(eq(schema.users.id, passwordReset.userId))
    .returning()

  if (!updatedUser) throw ServerError()

  return authenticateUser(event, updatedUser)
})
