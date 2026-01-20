import type { NewStripeCustomers, Users } from 'hub:db:schema'
import { eq } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { useServerStripe } from '#stripe/server'

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

export const syncStripeSubscriptionsForCustomer = async (event: H3Event, customerId: string) => {
  const stripe = useServerStripe(event)
  const { data: subscriptions } = await stripe.subscriptions.list({
    customer: customerId,
  })

  // // @ts-expect-error There is some typing issue with drizzle for now
  // db.insert(schema.stripeSubscriptions).values(subscriptions.map((s) => {
  //   return <NewStripeCustomers>{
  //     id: s.id as unknown as string,
  //     userId: customerId as number | string,
  //     status: s.status as string,
  //     metadata: s.metadata as Record<string, string>,
  //     quantity: 1,
  //     cancelAtPeriodEnd: s.cancel_at_period_end,
  //     created: new Date(s.created),
  //     currentPeriodStart: new Date(s.start_date),
  //     endedAt: s.ended_at ? new Date(s.ended_at) : null,
  //   }
  // }))
}
