// @ts-expect-error This is not typed at root level.
import { useRuntimeConfig } from '#imports'
import * as Sentry from '@sentry/nuxt'

const sentryDsn = useRuntimeConfig().public?.sentry?.dsn

if (sentryDsn) {
  Sentry.init({ dsn: sentryDsn })
}
else if (import.meta.dev) {
  console.info('Sentry DSN not found. Skipping Sentry initialization.')
}
}
