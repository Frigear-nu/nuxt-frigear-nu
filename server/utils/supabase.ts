import type { serverSupabaseServiceRole } from '#supabase/server'
import { eq } from 'drizzle-orm'

export const migrateSupabaseAccountById = async (serviceRole: ReturnType<typeof serverSupabaseServiceRole>, internalId: number, supabaseId: string) => {
  // connect to sb postgres so we can query the public and the auth schema (for social auth matching)

  const { data: sbAuthUser } = await serviceRole.from('auth.users')
    .select('*')
    .eq('id', supabaseId)
    .maybeSingle()

  if (!sbAuthUser) return console.warn(
    `Could not find user with id ${supabaseId} in supabase auth schema - skipping migration.`,
  )

  const { data: sbStripeCustomer } = await serviceRole.from('customers')
    .select('*')
    .eq('id', supabaseId)
    .maybeSingle<{ id: string }>()

  if (!sbStripeCustomer) throw new Error('Could not find stripe customer for supabase user.')

  const [stripeCustomer] = await db.insert(schema.stripeCustomers).values({
    userId: internalId,
    id: sbStripeCustomer.id,
  }).returning()

  if (!stripeCustomer) throw new Error(
    `Could not create stripe customer for supabase user ${supabaseId}.`,
  )

  // there will be a task runner that will migrate the rest.
  await db.update(schema.users)
    .set({ supabaseId: supabaseId })
    .where(eq(schema.users.id, internalId))
    .execute()

  return true
}

export const findSupabaseUserByEmail = async (serviceRole: ReturnType<typeof serverSupabaseServiceRole>, email: string) => {
  const { data: sbUser } = await serviceRole.from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle<{ id: string }>()

  if (!sbUser) return undefined

  return sbUser
}
