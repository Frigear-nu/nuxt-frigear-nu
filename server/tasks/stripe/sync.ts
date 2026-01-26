import { useServerStripe } from '#stripe/server'
import { transformStripePrice, transformStripeProduct } from '#server/services/stripe-webhooks'

export default defineTask({
  async run() {
    const stripe = useServerStripe(useEvent())
    // 1. fetch all products
    for await (const product of stripe.products.list({
      active: true,
    })) {
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
    for await (const price of stripe.prices.list({
      active: true,
    })) {
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
