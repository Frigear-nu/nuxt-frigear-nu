import {
  upsertStripePrice,
} from '#server/services/stripe-webhooks'
import { useTaskStripe } from '#server/utils/stripe'

export default defineTask({
  async run() {
    const stripe = useTaskStripe()

    let prices = 0

    for await (const price of stripe.prices.list({
      active: true,
    })) {
      await upsertStripePrice(stripe, price)
      prices++
    }

    return { result: { prices } }
  },
})
