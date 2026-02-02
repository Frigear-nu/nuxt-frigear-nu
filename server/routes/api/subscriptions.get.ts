import { db, schema } from '@nuxthub/db'
import { eq, and } from 'drizzle-orm'

export default defineCachedEventHandler(async () => {
  const products = await db.query.stripeProducts.findMany({
    where: () => eq(schema.stripeProducts.active, true),
    with: {
      prices: {
        where: () => {
          return and(
            eq(schema.stripePrices.active, true),
            eq(schema.stripePrices.type, 'recurring'),
          )
        },
      },
    },
  })

  if (!products) return []

  return products.map(p => ({
    ...p,
    prices: p.prices[0] || undefined,
  }))
}, { staleMaxAge: 60 * 60 * 10 }) // 10 min
