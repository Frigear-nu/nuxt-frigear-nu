// content.config.ts
import { defineCollection, defineContentConfig } from '@nuxt/content'
import { CollectionFormSchema } from './shared/schema/content-form'

export default defineContentConfig({
  collections: {
    forms: defineCollection({
      type: 'data',
      source: {
        include: 'forms/**/*.yml',
        prefix: '/',
      },
      schema: CollectionFormSchema,
    }),
    // ...
  },
})
