import { useValidatedBody } from 'h3-zod'
import { signInWithPasswordSchema } from '#shared/schema/auth'
import { ServerError, UnauthenticatedError } from '@nitrotool/errors'
import type { User } from '@nuxthub/db/schema'
import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (user) {
    return sendRedirect(event, await getDefaultRedirectForUser(event, user as User))
  }

  const { email, password, redirect } = await useValidatedBody(event, signInWithPasswordSchema)

  let matchedUser = await findUserByEmail(email)

  if (!matchedUser) throw UnauthenticatedError('errors.auth.signIn.failed')

  // This means the user A: has never logged in before, or B: has signed up with magic link
  // also trigger this on cus_ password prefix (from supabase migration)
  if (!matchedUser.passwordHash || matchedUser.passwordHash.startsWith('cus_')) {
    throw UnauthenticatedError('errors.auth.signIn.noPassword')
  }

  if (!await verifyPassword(matchedUser.passwordHash, password)) {
    throw UnauthenticatedError('errors.auth.signIn.failed')
  }

  // Ensures we track last login...
  [matchedUser] = await db
    .update(schema.users)
    .set({ lastLoginAt: new Date() })
    .where(eq(schema.users.id, matchedUser.id))
    .returning()

  if (!matchedUser) {
    throw ServerError('Failed to set lastLoginAt. Please try again later.')
  }

  await ensureStripeCustomer(matchedUser)

  //
  return authenticateUser(
    event,
    matchedUser,
    await getDefaultRedirectForUser(event, matchedUser, redirect),
  )
})
