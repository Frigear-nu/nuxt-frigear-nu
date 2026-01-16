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

  // todo: migrate the user coming from supabase somehow but via email link.
  const sb = serverSupabaseServiceRole(event)
  const { data: sbUser } = await sb.from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle<{ id: string }>()

  //
  let [createdUser] = await db.insert(schema.users).values({
    name,
    email,
    password: await hashPassword(password),
  }).returning()

  if (sbUser) {
    await migrateSupabaseAccountById(createdUser.id, sbUser.id)
    createdUser = await findUserByEmail(createdUser.email)
  }

  // todo: some mapping probably needs to be done here.
  await setUserSession(event, { user: createdUser })

  return sendRedirect(event, redirect || '/account')
})
