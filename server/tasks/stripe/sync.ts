import { useServerStripe } from '#stripe/server'
import {
  upsertStripePrice,
  upsertStripeProduct,
} from '#server/services/stripe-webhooks'

export default defineTask({
  async run() {
    const stripe = useServerStripe(useEvent())

    // 1. fetch all products
    for await (const product of stripe.products.list({
      active: true,
    })) {
      // todo: reuse code from #server/services/stripe-webhooks
      await upsertStripeProduct(product)
    }

    // 2. Fetch all prices
    for await (const price of stripe.prices.list({
      active: true,
    })) {
      await upsertStripePrice(stripe, price)
    }

    // FIXME: Add subscription sync
    // // 3. Fetch all subscriptions that are active
    // const { data: subscriptions } = await stripe.subscriptions.list({
    //   status: 'active',
    // })

    return { result: true }
  },
})
