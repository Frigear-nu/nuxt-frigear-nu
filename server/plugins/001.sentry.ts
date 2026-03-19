import { sentryCloudflareNitroPlugin } from '@sentry/nuxt/module/plugins'

export default defineNitroPlugin(sentryCloudflareNitroPlugin(() => {
  if (!useRuntimeConfig().public.sentry.dsn) {
    console.warn('Sentry DSN not found, skipping Sentry plugin.')
    return { enabled: false }
  }

  return {
    dsn: useRuntimeConfig().public.sentry.dsn,
    tracesSampleRate: useRuntimeConfig().public.sentry?.tracesSampleRate || 1.0,
  }
}))
