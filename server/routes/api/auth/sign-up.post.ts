import { signUpSchema } from '#shared/schema/auth'
import { useValidatedBody } from 'h3-zod'
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (user) return sendRedirect(event, '/account')

  const { name, email, password, redirect } = await useValidatedBody(event, signUpSchema)

  // check if we need to migrate this user:
  const internalUser = await findUserByEmail(email)

  if (internalUser) throw createError({ statusCode: 400, message: 'User already exists.' })

  //
  let [createdUser] = await db.insert(schema.users).values({
    name,
    email,
    password: await hashPassword(password),
  }).returning()

  const serviceRole = serverSupabaseServiceRole(event)
  const sbUser = await findSupabaseUserByEmail(serviceRole, email)
  if (sbUser) {
    await migrateSupabaseAccountById(serviceRole, createdUser.id, sbUser.id)
    createdUser = await findUserByEmail(createdUser.email)
    if (!createdUser.isMigrated) throw new Error('Could not migrate supabase account.')
  }

  // todo: some mapping probably needs to be done here.
  await setUserSession(event, { user: createdUser })

  return sendRedirect(event, redirect || '/account')
})
