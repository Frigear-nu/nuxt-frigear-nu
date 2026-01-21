import { useValidatedBody } from 'h3-zod'
import { signInWithPasswordSchema } from '#shared/schema/auth'
import { UnauthenticatedError } from '@nitrotool/errors'
import type { Users } from 'hub:db:schema'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (user) {
    return sendRedirect(event, await getDefaultRedirectForUser(event, user as Users))
  }

  const { email, password, redirect } = await useValidatedBody(event, signInWithPasswordSchema)

  const matchedUser = await findUserByEmail(email)

  // FIXME: Add a toast for the errors here in the UI.
  if (!matchedUser) throw UnauthenticatedError('errors.auth.signIn.failed')

  if (!matchedUser.passwordHash) throw UnauthenticatedError('errors.auth.signIn.noPassword')

  if (!await verifyPassword(matchedUser.passwordHash, password)) {
    throw UnauthenticatedError('errors.auth.signIn.failed')
  }

  await createStripeCustomerFromMigration(matchedUser)

  //
  return authenticateUser(
    event,
    matchedUser,
    await getDefaultRedirectForUser(event, matchedUser, redirect),
  )
})
