import { useValidatedBody } from 'h3-zod'
import { signInWithPasswordSchema } from '#shared/schema/auth'
import { UnauthenticatedError } from '@nitrotool/errors'
import type { Users } from '@nuxthub/db/schema'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (user) {
    return sendRedirect(event, await getDefaultRedirectForUser(event, user as Users))
  }

  const { email, password, redirect } = await useValidatedBody(event, signInWithPasswordSchema)

  const matchedUser = await findUserByEmail(email)

  // FIXME: Add a toast for the errors here in the UI.
  if (!matchedUser) throw UnauthenticatedError('errors.auth.signIn.failed')

  // This means the user A: has never logged in before, or B: has signed up with magic link
  if (!matchedUser.passwordHash) throw UnauthenticatedError('errors.auth.signIn.noPassword')

  if (!await verifyPassword(matchedUser.passwordHash, password)) {
    throw UnauthenticatedError('errors.auth.signIn.failed')
  }

  await ensureStripeCustomer(matchedUser)

  //
  return authenticateUser(
    event,
    matchedUser,
    await getDefaultRedirectForUser(event, matchedUser, redirect),
  )
})
