import {
  upsertStripeCustomerSubscription,
  upsertStripePrice,
  upsertStripeProduct,
} from '#server/services/stripe-webhooks'
import { useTaskStripe } from '#server/utils/stripe'

export default defineTask({
  async run() {
    const stripe = useTaskStripe()

    // FIXME: this could probably be separate tasks to isolate any failures.

    // 1. fetch all products
    for await (const product of stripe.products.list({
      active: true,
    })) {
      await upsertStripeProduct(product)
    }

    // 2. Fetch all prices
    for await (const price of stripe.prices.list({
      active: true,
    })) {
      await upsertStripePrice(stripe, price)
    }

    // 3. Fetch all subscriptions
    for await (const subscription of stripe.subscriptions.list({
      status: 'active',
    })) {
      await upsertStripeCustomerSubscription(subscription)
    }

    return { result: true }
  },
})
