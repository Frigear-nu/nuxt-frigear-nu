import { signUpSchema } from '#shared/schema/auth'
import { useValidatedBody } from 'h3-zod'
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (user) return sendRedirect(event, '/account')

  const { name, email, password, redirect } = await useValidatedBody(event, signUpSchema)

  // check if we need to migrate this user:
  // @ts-expect-error There are soem typing issue with drizzle for now
  const internalUser = await db.query.users.findFirst({ where: { email } })

  if (internalUser) throw createError({ statusCode: 400, message: 'User already exists.' })

  // todo: migrate the user coming from supabase somehow but via email link.
  const sb = serverSupabaseServiceRole(event)
  const { data: sbUser } = await sb.from('users').select('*').eq('email', email).maybeSingle()
  const createdUser = await db.insert(schema.users).values({
    name,
    email,
    password: await hashPassword(password),
    isMigrated: !sbUser,
  }).returning()

  // todo: some mapping probably needs to be done here.
  await setUserSession(event, { user: createdUser })

  return sendRedirect(event, redirect || '/account')
})
