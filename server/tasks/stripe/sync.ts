import { useServerStripe } from '#stripe/server'
import { transformStripePrice, transformStripeProduct } from '#server/services/stripe-webhooks'

export default defineTask({
  async run() {
    const stripe = useServerStripe(useEvent())
    // 1. fetch all products
    const { data: products } = await stripe.products.list({
      active: true,
    })

    for (const product of products) {
      // todo: reuse code from #server/services/stripe-webhooks
      const { id, ...remaining } = transformStripeProduct({ object: product })
      await db
        .insert(schema.stripeProducts)
        .values({ id, ...remaining })
        .onConflictDoUpdate({
          target: schema.stripeProducts.id,
          set: remaining,
        })
    }

    // 2. Fetch all prices
    const { data: prices } = await stripe.prices.list({
      active: true,
    })

    for (const price of prices) {
      const { id, ...remaining } = transformStripePrice({ object: price })

      await db
        .insert(schema.stripePrices)
        .values({ id, ...remaining })
        .onConflictDoUpdate({
          target: schema.stripePrices.id,
          set: remaining,
        })
    }

    // // 3. Fetch all subscriptions that are active
    // const { data: subscriptions } = await stripe.subscriptions.list({
    //   status: 'active',
    // })

    return { result: true }
  },
})
