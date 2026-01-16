import { signUpSchema } from '#shared/schema/auth'
import { useValidatedBody } from 'h3-zod'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (!user) return sendRedirect(event, '/account')

  const { name, email, password, redirect } = await useValidatedBody(event, signUpSchema)
  const createdUser = await db.insert(schema.users).values({
    name,
    email,
    password: await hashPassword(password),
    isMigrated: true,
  }).returning()

  // todo: some mapping probably needs to be done here.
  await setUserSession(event, { user: createdUser })

  return sendRedirect(event, redirect || '/account')
})
