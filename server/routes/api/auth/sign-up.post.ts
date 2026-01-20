import { signUpSchema } from '#shared/schema/auth'
import { useValidatedBody } from 'h3-zod'
import { serverSupabaseServiceRole } from '#supabase/server'
import { EntityAlreadyExistsError, ServerError } from '@nitrotool/errors'
import type { Users } from 'hub:db:schema'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const { verifyEmail, migrateSupabase } = useRuntimeConfig(event).auth
  const defaultRedirect = verifyEmail ? '/auth/verify-email' : '/account'
  if (user) return sendRedirect(event, defaultRedirect)

  const { name, email, password, redirect } = await useValidatedBody(event, signUpSchema)

  const internalUser = await findUserByEmail(email)

  if (internalUser) throw EntityAlreadyExistsError('errors.exists')

  let createdUser: Users | null;
  // @ts-expect-error Drizzle has some bugs with types
  [createdUser] = await db.insert(schema.users).values({
    name,
    email,
    password: await hashPassword(password),
    emailVerifiedAt: verifyEmail ? new Date() : null,
  }).returning()

  // check if there is a supabase user
  let wasSupabaseMigrated = false
  if (migrateSupabase) {
    logger.info('Checking for supabase user...', { email })
    try {
      const serviceRole = serverSupabaseServiceRole(event)
      const supabaseUser = await findSupabaseUserByEmail(serviceRole, email)
      if (supabaseUser) {
        logger.info('Found supabase user, migrating account...', { supabaseUser })
        await migrateSupabaseAccountById(serviceRole, createdUser.id, supabaseUser.id)
        wasSupabaseMigrated = true
      }
    }
    catch (err: unknown) {
      logger.error('Error migrating supabase account', { err })
      wasSupabaseMigrated = false
      if (import.meta.dev) throw err
    }
  }

  if (wasSupabaseMigrated) {
    // here we should probably verify the email before we allow access,
    // but considering we always have it enabled, it might not be worth it.
    // For now, we only refresh the user.
    createdUser = await findUserByEmail(email)
  }

  if (!createdUser) throw ServerError('errors.auth.signUp.failedCreate')

  return authenticateUser(
    event,
    createdUser,
    verifyEmail ? defaultRedirect : redirect || defaultRedirect,
  )
})
