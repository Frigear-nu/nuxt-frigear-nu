import { upsertStripeCustomerSubscription } from '#server/services/stripe-webhooks'
import { useTaskStripe } from '#server/utils/stripe'
import { db, schema } from '@nuxthub/db'
import consola from 'consola'

const log = consola.withTag('stripe:sync:supabase-users')

const CONCURRENCY = 5

async function processInBatches<T>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    await Promise.allSettled(items.slice(i, i + batchSize).map(fn))
  }
}

export default defineTask({
  async run() {
    const stripe = useTaskStripe()

    const users = await db.query.users.findMany({
      where: (users, { like }) => like(users.passwordHash, 'cus_%'),
    })

    log.info(`Found ${users.length} Stripe customers to sync`)

    let subscriptionCount = 0

    await processInBatches(users, CONCURRENCY, async (user) => {
      const customerId = user.passwordHash as string

      const stripeCustomer = await stripe.customers.retrieve(customerId)
      if (!stripeCustomer || stripeCustomer.deleted) {
        log.warn(`Skipping user ${user.id}: Stripe customer ${customerId} not found or deleted`)
        return
      }

      await db
        .insert(schema.stripeCustomers)
        .values({ userId: user.id, id: stripeCustomer.id })
        .onConflictDoNothing()

      const { data: subscriptions } = await stripe.subscriptions.list({
        customer: stripeCustomer.id,
        status: 'active',
      })

      log.info(`User ${user.id}: found ${subscriptions.length} active subscription(s)`)

      await Promise.allSettled(
        subscriptions.map(async (subscription) => {
          await upsertStripeCustomerSubscription(subscription)
          subscriptionCount++
        }),
      )
    })

    log.info(`Sync complete. Upserted ${subscriptionCount} subscription(s).`)
    return { result: { subscriptions: subscriptionCount } }
  },
})
