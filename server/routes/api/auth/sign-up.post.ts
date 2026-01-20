import { signUpSchema } from '#shared/schema/auth'
import { useValidatedBody } from 'h3-zod'
import { EntityAlreadyExistsError, ServerError } from '@nitrotool/errors'
import type { Users } from 'hub:db:schema'

export default defineEventHandler(async (event) => {
  const { signUp, verifyEmail } = useRuntimeConfig(event).auth
  const { user } = await getUserSession(event)

  if (user) {
    return sendRedirect(event, await getDefaultRedirectForUser(event, user as Users))
  }

  if (!signUp) throw createError({ statusCode: 400, message: 'Signup is disabled.' })

  const { name, email, password } = await useValidatedBody(event, signUpSchema)

  const internalUser = await findUserByEmail(email)

  if (internalUser) throw EntityAlreadyExistsError('errors.auth.signUp.failed')

  // @ts-expect-error Drizzle has some bugs with types
  const [createdUser] = await db.insert(schema.users).values({
    name,
    email,
    password: await hashPassword(password),
    emailVerifiedAt: verifyEmail ? null : new Date(),
  }).returning()

  if (!createdUser) throw ServerError('errors.auth.signUp.failedCreate')

  return mapUserToSession(createdUser)
})
