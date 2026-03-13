// @ts-expect-error This is not typed at root level.
import { useRuntimeConfig } from '#imports'
import * as Sentry from '@sentry/nuxt'

if (!useRuntimeConfig().public?.sentry?.dsn) {
  console.log('Sentry DSN not found. Skipping Sentry initialization.')
}
else {
  Sentry.init({
    dsn: useRuntimeConfig().public.sentry.dsn,
  })
}
