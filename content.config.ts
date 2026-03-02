import { z } from 'zod/v4'
import { defineContentConfig, defineCollection } from '@nuxt/content'

const translated = z.string().or(z.record(z.string(), z.string()))

export default defineContentConfig({
  collections: {
    memberships: defineCollection({
      source: 'memberships/**/*.yml',
      type: 'page',
      schema: z.object({
        name: translated,
        description: translated,
        stripeId: z.string(),
        price: z.number(),
        currency: z.string(),
        billingCycle: z.string().optional(),
        terms: translated,
        features: z.array(translated).optional(),
      }),
    }),
  },
})
