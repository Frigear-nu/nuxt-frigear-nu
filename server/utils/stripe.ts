import { db, schema } from '@nuxthub/db'
import type { Users } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'

// This is only required due to the stripe module requiring access to the event context.
export const useTaskStripe = () => {
  const { stripe: { key: stripeKey } } = useRuntimeConfig()

  return new Stripe(stripeKey)
}

export const createStripeCustomerFromMigration = async (user: Users) => {
  if (user.isMigrated) return

  // ensures we only attempt to migrate users with a stripe customer id in the pw field
  if (!user.passwordHash || !user.passwordHash.startsWith('cus_')) {
    return
  }

  // create the stripe customer
  await db
    .insert(schema.stripeCustomers)
    .values({
      userId: user.id,
      id: user.passwordHash,
    })

  await db
    .update(schema.users)
    .set({ passwordHash: null })
    .where(eq(schema.users.id, user.id))
}

export const findStripeCustomerByEmail = async (email: string) => {
  const { data: customer } = await useTaskStripe()
    .customers
    .list({ email, limit: 1 })

  if (!customer || !customer.length) return undefined

  return customer[0] as Stripe.Customer
}
