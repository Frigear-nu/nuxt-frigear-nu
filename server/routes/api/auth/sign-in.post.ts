import { useValidatedBody } from 'h3-zod'
import { signInWithPasswordSchema } from '#shared/schema/auth'
import { ServerError, UnauthenticatedError } from '@nitrotool/errors'
import { getDefaultRedirectForUser } from '~~/server/utils/user'
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const { migrateSupabase } = useRuntimeConfig(event).auth
  if (user) {
    return sendRedirect(event, await getDefaultRedirectForUser(event, user))
  }

  const { email, password, redirect } = await useValidatedBody(event, signInWithPasswordSchema)

  let matchedUser = await findUserByEmail(email)

  if (!matchedUser) throw UnauthenticatedError('errors.auth.signIn.failed')

  if (!matchedUser.passwordHash) throw UnauthenticatedError('errors.auth.signIn.noPassword')

  if (!await verifyPassword(matchedUser.passwordHash, password)) {
    throw UnauthenticatedError('errors.auth.signIn.failed')
  }

  if (migrateSupabase && !matchedUser.isMigrated) {
    const serviceRole = serverSupabaseServiceRole(event)
    const supabaseUser = await findSupabaseUserByEmail(serviceRole, email)
    if (supabaseUser) {
      await migrateSupabaseAccountById(serviceRole, matchedUser.id, supabaseUser.id)
      matchedUser = await findUserByEmail(email)
    }
  }

  if (!matchedUser) throw ServerError('errors.auth.signIn.failed')

  return authenticateUser(event, matchedUser, await getDefaultRedirectForUser(event, matchedUser, redirect))
})
