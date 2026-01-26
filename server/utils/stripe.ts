import type { Users } from 'hub:db:schema'

export const createStripeCustomerFromMigration = async (user: Users) => {
  if (user.isMigrated) return

  if (!user.passwordHash || !user.passwordHash.startsWith('cus_')) {
    return
  }

  // create the stripe customer
  await db.insert(schema.stripeCustomers).values({
    userId: user.id,
    id: user.passwordHash,
  })

  await db.update(schema.users).set({
    passwordHash: null,
  }).where(eq(schema.users.id, user.id))
}
