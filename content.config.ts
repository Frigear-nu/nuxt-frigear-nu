import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod/v4'

// const membership = z.enum(['annual', 'quarterly', 'monthly', 'free']).or(z.string())
const translated = z.string().or(z.record(z.string(), z.string()))
const image = z.union([
  z.object({
    src: z.string(),
    alt: z.string(),
  }),
  z.string(),
])

const requirement = z.union([
  z.object({
    type: z.literal('membership'),
    method: z.literal('any').default('any'),
    title: translated,
  }),
  z.object({
    type: z.literal('membership'),
    method: z.literal('one_of'),
    priceIds: z.array(z.string()),
    title: translated,
  }),
])

const environment = z.enum(['production', 'staging', 'development'])
const variables = z.union([
  z.record(
    environment,
    z.record(z.string(), z.string()),
  ),
  z.record(z.string(), z.string()),
])

const address = z.union([
  z.string(),
  z.object({
    value: z.string(),
    link: z.union([z.string(), z.url()]).optional(),
  }),
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
        description: translated.optional(),
        body: translated.optional(),
        image: image.optional(),
        slug: z.string().optional(),
        alias: z.array(z.string()).optional(),
        date: z.date(),
        start: z.date().optional(),
        end: z.date().optional(),
        address: address.optional(),
        defaultTicket: z.string().optional(),
        requirements: z.array(requirement).optional(),
        variables: variables.optional(),
        tickets: z.record(z.enum(['default']).or(z.string()), z.object({
          name: translated,
          description: translated.optional(),
          price: z.number(),
          hidePrice: z.boolean().optional(),
          currency: z.string(),
          stripeId: z.string().optional(),
          requirements: z.array(requirement).optional(),
          // Available additional products to purchase, will use stripe data?
          products: z.object({
            title: translated,
            require: z.enum(['one_of']).optional(),
            items: z.array(z.object({
              id: z.string(), // stripeId
              label: translated,
              description: translated.optional(),
              price: z.number(),
              currency: z.string(),
            })),
          }).optional(),
        })),
      }),
    }),
  },
})
