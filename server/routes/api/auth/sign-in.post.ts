import { useValidatedBody } from 'h3-zod'
import { signInWithPasswordSchema } from '#shared/schema/auth'
import { UnauthenticatedError } from '@nitrotool/errors'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (user) {
    return sendRedirect(event, await getDefaultRedirectForUser(event, user))
  }

  const { email, password, redirect } = await useValidatedBody(event, signInWithPasswordSchema)

  const matchedUser = await findUserByEmail(email)

  if (!matchedUser) throw UnauthenticatedError('errors.auth.signIn.failed')

  if (!matchedUser.passwordHash) throw UnauthenticatedError('errors.auth.signIn.noPassword')

  if (!await verifyPassword(matchedUser.passwordHash, password)) {
    throw UnauthenticatedError('errors.auth.signIn.failed')
  }

  return authenticateUser(event, matchedUser, await getDefaultRedirectForUser(event, matchedUser, redirect))
})
