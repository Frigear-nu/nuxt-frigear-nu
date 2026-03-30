import {
  upsertStripeProduct,
} from '#server/services/stripe-webhooks'
import { useTaskStripe } from '#server/utils/stripe'

export default defineTask({
  async run() {
    const stripe = useTaskStripe()

    let products = 0

    for await (const product of stripe.products.list({
      active: true,
    })) {
      await upsertStripeProduct(product)
      products++
    }

    return { result: { products } }
  },
})
