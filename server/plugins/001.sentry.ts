import { sentryCloudflareNitroPlugin } from '@sentry/nuxt/module/plugins'
import * as Sentry from '@sentry/nuxt'

export default defineNitroPlugin(sentryCloudflareNitroPlugin(() => {
  if (!useRuntimeConfig().public.sentry.dsn) {
    if (import.meta.dev) {
      console.warn('Sentry DSN not found, skipping Sentry plugin.')
    }
    return { enabled: false }
  }

  return {
    dsn: useRuntimeConfig().public.sentry.dsn,
    tracesSampleRate: useRuntimeConfig().public.sentry?.tracesSampleRate || 1.0,
    integrations: [
      Sentry.httpIntegration({
        dropSpansForIncomingRequestStatusCodes: [404],
      }),
    ],
  }
}))
