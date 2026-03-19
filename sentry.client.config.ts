import { useRuntimeConfig } from '#imports'
import * as Sentry from '@sentry/nuxt'

const sentryDsn = useRuntimeConfig().public?.sentry?.dsn

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    sendDefaultPii: true,
    tracesSampleRate: useRuntimeConfig().public?.sentry?.tracesSampleRate ?? 1.0,
  })
}
else if (import.meta.dev) {
  console.info('Sentry DSN not found. Skipping Sentry initialization.')
}
