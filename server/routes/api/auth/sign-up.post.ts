import { signUpSchema } from '#shared/schema/auth'
import { useValidatedBody } from 'h3-zod'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (user) return sendRedirect(event, '/account')

  const { name, email, password, redirect } = await useValidatedBody(event, signUpSchema)

  // check if we need to migrate this user:
  const internalUser = await findUserByEmail(email)

  if (internalUser) throw createError({ statusCode: 409, message: 'error.exists' })

  //
  const [createdUser] = await db.insert(schema.users).values({
    name,
    email,
    password: await hashPassword(password),
  }).returning()

  // check if email verification is enabled.

  // todo: some mapping probably needs to be done here.
  await setUserSession(event, { user: createdUser })

  return sendRedirect(event, redirect || '/account')
})
