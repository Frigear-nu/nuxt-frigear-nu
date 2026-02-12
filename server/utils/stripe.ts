import { db, schema } from '@nuxthub/db'
import type { Users } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'

// This is only required due to the stripe module requiring access to the event context.
export const useTaskStripe = () => {
  const { stripe: { key: stripeKey } } = useRuntimeConfig()

  return new Stripe(stripeKey)
}

// this should only be called on sign-in/up
export const ensureStripeCustomer = async (user: Users) => {
  if (user.isMigrated) return

  // ensures we only attempt to migrate users with a stripe customer id in the pw field
  const stripe = useTaskStripe()

  // This is some magic to associate imported users from SB
  if (user.passwordHash && user.passwordHash.startsWith('cus_')) {
    const stripeCustomer = await stripe.customers.retrieve(user.passwordHash)

    if (stripeCustomer) {
      await db
        .update(schema.users)
        .set({ passwordHash: null })
        .where(eq(schema.users.id, user.id))

      return associateUserWithStripeCustomer(user.id, stripeCustomer.id)
    }
  }

  // This means it is a completely new user
  // create the stripe customer from stripe `cus_<something>` inserted from import instead of pw.
  const stripeCustomer = await findStripeCustomerByEmail(user.email)

  if (stripeCustomer) {
    return associateUserWithStripeCustomer(user.id, stripeCustomer.id)
  }

  // Create a new stripe customer
  // TODO: We might need more details here, but for now this should be fine so we are sure there is a stripe customer for all users.
  const newStripeCustomer = await stripe.customers.create({
    email: user.email,
    name: user.name,
  })

  if (!newStripeCustomer.id) {
    throw new Error('Could not create stripe customer')
  }

  await associateUserWithStripeCustomer(user.id, newStripeCustomer.id)
}

const associateUserWithStripeCustomer = async (userId: Users['id'], stripeCustomerId: Stripe.Customer['id']) => {
  await db
    .insert(schema.stripeCustomers)
    .values({
      userId,
      id: stripeCustomerId,
    })
    .onConflictDoUpdate({
      target: schema.stripeCustomers.id,
      set: { userId },
    })
}

export const findStripeCustomerByEmail = async (email: string) => {
  const { data: customer } = await useTaskStripe()
    .customers
    .list({ email, limit: 1 })

  if (!customer || !customer.length) return undefined

  return customer[0] as Stripe.Customer
}
