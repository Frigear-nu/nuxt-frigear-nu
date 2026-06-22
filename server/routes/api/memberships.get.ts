import { db, schema } from '@nuxthub/db'
import { eq, and } from 'drizzle-orm'
import type { ParsedDisabledRange, PublicPrice } from '#shared/types/membership'

type DisabledRangeType = [string, string, string]

const replacers = {
  fullYear: () => new Date().getFullYear(),
}
const parseDisabledRangeDate = (text?: string): Date => {
  if (!text) {
    return new Date()
  }
  // Replace all items: e.g {fullYear} or other dynamic inserts.:
  return new Date(text.replaceAll(/\{(\w+)\}/g, (_, key) => {
    return replacers[key as keyof typeof replacers]?.() || key
  }))
}

const parseDisabledRanges = (rangeText: string): ParsedDisabledRange[] => {
  try {
    const parsed = JSON.parse(rangeText) as DisabledRangeType[]
    return parsed.map(([type, start, end]) => {
      return [
        type,
        parseDisabledRangeDate(start),
        parseDisabledRangeDate(end),
      ]
    })
  }
  catch (err) {
    if (import.meta.dev) {
      console.error('Failed to parse disabled ranges', err, rangeText)
    }
    return []
  }
}

export default defineCachedEventHandler(async () => {
  const products = await db.query.stripeProducts.findMany({
    where: () => eq(schema.stripeProducts.active, true),
    with: {
      prices: {
        where: () => {
          return and(
            eq(schema.stripePrices.active, true),
            eq(schema.stripePrices.type, 'recurring'), // TODO: Figure out how we do not add more stuff here randomly :)
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
          images: price.images,
          interval: price.interval || 'month',
          intervalCount: price.intervalCount,
          disabledRanges: parseDisabledRanges(price.metadata?.disabled_ranges || '[]'),
        }
      }),
    }
  })
    .flatMap(({ prices }) => prices)
    .sort((a, b) => a.price < b.price ? -1 : 1)
}, { maxAge: import.meta.dev ? 15 : 60 * 10, swr: true }) // 10 min
