import { signUpSchema } from '#shared/schema/auth'
import { useValidatedBody } from 'h3-zod'
import { EntityAlreadyExistsError, ServerError } from '@nitrotool/errors'
import type { Users } from 'hub:db:schema'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const { verifyEmail } = useRuntimeConfig(event).auth

  if (user) {
    return sendRedirect(event, await getDefaultRedirectForUser(event, user as Users))
  }

  const { name, email, password } = await useValidatedBody(event, signUpSchema)

  const internalUser = await findUserByEmail(email)

  if (internalUser) throw EntityAlreadyExistsError('errors.auth.signUp.failed')

  // @ts-expect-error Drizzle has some bugs with types
  const [createdUser] = await db.insert(schema.users).values({
    name,
    email,
    password: await hashPassword(password),
    emailVerifiedAt: verifyEmail ? new Date() : null,
  }).returning()

  if (!createdUser) throw ServerError('errors.auth.signUp.failedCreate')

  return mapUserToSession(createdUser)
})
