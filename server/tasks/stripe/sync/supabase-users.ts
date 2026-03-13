import {
  upsertStripeCustomerSubscription,
} from '#server/services/stripe-webhooks'
import { useTaskStripe } from '#server/utils/stripe'
import { db, schema } from '@nuxthub/db'

export default defineTask({
  async run() {
    const stripe = useTaskStripe()
    const usersToImport = await db.query.users.findMany({
      where: (users, { like }) => like(users.passwordHash, 'cus_%'),
    })

    let subscriptionCounts = 0
    await Promise.allSettled(
      usersToImport
        .filter((user) => {
          return user.passwordHash && user.passwordHash.startsWith('cus_')
        })
        .map(async (user) => {
          const stripeCustomer = await stripe.customers.retrieve(user.passwordHash as string)
          await db.insert(schema.stripeCustomers)
            .values({
              userId: user.id,
              id: stripeCustomer.id,
            })
            .onConflictDoNothing()

          // fetch subscriptions
          const subscriptions = await stripe.subscriptions.list({
            customer: stripeCustomer.id,
            status: 'active',
          })

          if (subscriptions.data.length) {
            await Promise.allSettled(
              subscriptions.data.map(async (subscription) => {
                await upsertStripeCustomerSubscription(subscription)
                subscriptionCounts++
              }),
            )
          }
        }))

    return { result: { subscriptions: subscriptionCounts } }
  },
})
