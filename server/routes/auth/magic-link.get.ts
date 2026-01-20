import { signInWithMagicLinksSchema } from '#shared/schema/auth'
import { useValidatedQuery } from 'h3-zod'
import { isAfter } from 'date-fns'
import { NotFoundError, ServerError } from '@nitrotool/errors'
import { and, eq, gt, isNull } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { token } = await useValidatedQuery(event, signInWithMagicLinksSchema)
  const currentTime = new Date()
  const [magicLink] = await db.select().from(schema.magicLinks)
    // .set({ usedAt: currentTime })
    .where(
      and(
        isNull(schema.magicLinks.usedAt),
        eq(schema.magicLinks.token, token),
        gt(schema.magicLinks.expiresAt, currentTime),
      ),
    )
    // .returning()

  if (!magicLink || isAfter(currentTime, magicLink.expiresAt)) {
    throw ServerError('errors.auth.magicLink.invalid')
  }

  let [user] = await db.update(schema.users)
    .set({ lastLoginAt: currentTime })
    .where(eq(schema.users.id, magicLink.userId))
    .returning()

  if (!user) throw NotFoundError()

  await createStripeCustomerFromMigration(user)

  // Let's set the email to verified since this comes via an email.
  if (!user.emailVerifiedAt) {
    [user] = await db.update(schema.users)
      .set({ emailVerifiedAt: currentTime })
      .where(eq(schema.users.id, user.id))
      .returning()
  }

  // lastly, mark the link as used.
  await db.update(schema.magicLinks)
    .set({ usedAt: currentTime })
    .where(eq(schema.magicLinks.id, magicLink.id))

  return authenticateUser(event, user, magicLink.redirectUrl || '/account')
})
