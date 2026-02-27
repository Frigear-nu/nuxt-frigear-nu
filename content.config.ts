import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod/v4'

const membership = z.enum(['annual', 'quarterly', 'monthly', 'free']).or(z.string())
const translated = z.string().or(z.record(z.string(), z.string()))
const image = z.union([
  z.object({
    src: z.string(),
    alt: z.string(),
  }),
  z.string(),
])

export default defineContentConfig({
  collections: {
    events: defineCollection({
      source: {
        include: 'events/**/*.yml',
      },
      type: 'page',
      schema: z.object({
        name: translated,
        excerpt: translated.optional(),
        description: translated.optional(),
        image: image.optional(),
        slug: z.string().optional(),
        alias: z.array(z.string()).optional(),
        date: z.date(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        address: z.string().optional(),
        tickets: z.record(z.enum(['default']).or(z.string()), z.object({
          name: translated,
          description: translated.optional(),
          price: z.number(),
          currency: z.string(),
          stripeId: z.string(),
          // priceId or for subscription?
          memberships: z.array(membership).optional(),
          // Available additional products to purchase, will use stripe data?
          addons: z.array(z.string()).optional(),
        })),
      }),
    }),
  },
})
