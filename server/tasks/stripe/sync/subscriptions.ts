import {
  upsertStripeCustomerSubscription,
} from '#server/services/stripe-webhooks'
import { useTaskStripe } from '#server/utils/stripe'

export default defineTask({
  async run() {
    const stripe = useTaskStripe()

    let subscriptions = 0

    for await (const subscription of stripe.subscriptions.list()) {
      await upsertStripeCustomerSubscription(subscription)
      subscriptions++
    }

    return { result: { subscriptions } }
  },
})
