import { z } from 'zod/v4'
import { defineCollection, defineContentConfig } from '@nuxt/content'

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
    projects: defineCollection({
      source: 'projects/**/*.yml',
      type: 'page',
      schema: z.object({
        image: image,
        name: translated,
        date: z.date(),
        categories: z.array(z.string()),
        description: translated,
        body: translated,
      }),
    }),
  },
})
