import { signInWithMagicLinksSchema } from '#shared/schema/auth'
import { useValidatedQuery } from 'h3-zod'
import { isAfter } from 'date-fns'
import { NotFoundError, ServerError } from '@nitrotool/errors'
import { and, eq, gt, isNull } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { token, redirect } = await useValidatedQuery(event, signInWithMagicLinksSchema)
  const currentTime = new Date()
  const magicLink = await db.query.magicLinks.findFirst({
    where: and(
      eq(schema.magicLinks.token, token),
      isNull(schema.magicLinks.usedAt),
      gt(schema.magicLinks.expiresAt, currentTime),
    ),
  })

  if (!magicLink || isAfter(currentTime, magicLink.expiresAt)) {
    throw ServerError('Invalid link.')
  }

  let user = await db.query.users.findFirst({
    where: eq(schema.users.id, magicLink.userId),
  })

  if (!user) throw NotFoundError()

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

  return authenticateUser(event, user, redirect)
})
