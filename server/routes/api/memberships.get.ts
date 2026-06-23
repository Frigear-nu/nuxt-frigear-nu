import { db, schema } from '@nuxthub/db'
import { eq, and } from 'drizzle-orm'
import {
  parseDisabledRangesFromJsonString,
  type PublicPrice,
} from '#shared/types/membership'

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
  return products.map((product) => {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      images: product.images,
      prices: product.prices.map((price): PublicPrice => {
        return {
          id: price.id,
          title: price.metadata?.title || '',
          title_en: price.metadata?.title_en || price.metadata?.title || undefined,
          description: price.metadata?.description || price.description || '',
          description_en: price.metadata?.description_en || price.metadata?.description || price.description || undefined,
          price: price.unitAmount,
          currency: price.currency,
          images: price.images || product.images,
          interval: price.interval || 'month',
          intervalCount: price.intervalCount,
          disabledRanges: parseDisabledRangesFromJsonString(price.metadata?.disabled_ranges || '[]'),
        }
      }),
    }
  })
    .flatMap(({ prices }) => prices)
    .sort((a, b) => a.price < b.price ? -1 : 1)
}, { maxAge: import.meta.dev ? 15 : 60 * 10, swr: true }) // 10 min
