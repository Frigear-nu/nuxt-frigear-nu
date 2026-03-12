import {
  upsertStripeProduct,
  upsertStripePrice,
  upsertStripeCustomer,
  upsertStripeCustomerSubscription,
} from '#server/services/stripe-webhooks'
import { useTaskStripe } from '#server/utils/stripe'

export default defineTask({
  async run() {
    const stripe = useTaskStripe()

    const counts = {
      products: 0,
      prices: 0,
      customers: 0,
      subscriptions: 0,
    }
    // FIXME: this could probably be separate tasks to isolate any failures.

    // 1. fetch all products
    for await (const product of stripe.products.list({
      active: true,
    })) {
      await upsertStripeProduct(product)
      counts.products++
    }

    // 2. Fetch all prices
    for await (const price of stripe.prices.list({
      active: true,
    })) {
      await upsertStripePrice(stripe, price)
      counts.prices++
    }

    // 3. Fetch all customers subscriptions
    for await (const customer of stripe.customers.list()) {
      await upsertStripeCustomer(customer)
      counts.customers++
    }

    // 4. Fetch all subscriptions
    for await (const subscription of stripe.subscriptions.list({
      status: 'active',
    })) {
      await upsertStripeCustomerSubscription(subscription)
      counts.subscriptions++
    }

    return { result: counts }
  },
})
