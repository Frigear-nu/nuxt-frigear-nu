import {
  upsertStripeCustomer,
} from '#server/services/stripe-webhooks'
import { useTaskStripe } from '#server/utils/stripe'

export default defineTask({
  async run() {
    const stripe = useTaskStripe()

    let customers = 0

    for await (const customer of stripe.customers.list()) {
      await upsertStripeCustomer(customer)
      customers++
    }

    return { result: { customers } }
  },
})
