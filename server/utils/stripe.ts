import type { Users } from 'hub:db:schema'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'

// This is only required due to the stripe module requiring access to the event context.
export const useTaskStripe = () => {
  const { stripe: { key: stripeKey } } = useRuntimeConfig()

  return new Stripe(stripeKey)
}

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
