import { sentryCloudflareNitroPlugin } from '@sentry/nuxt/module/plugins'

export default defineNitroPlugin((nitroApp) => {
  if (!useRuntimeConfig().public.sentry.dsn) {
    console.warn('Sentry DSN not found, skipping Sentry plugin.')
    return
  }

  return sentryCloudflareNitroPlugin({
    dsn: useRuntimeConfig().public.sentry.dsn,
    tracesSampleRate: useRuntimeConfig().public.sentry?.tracesSampleRate || 1.0,
  })(nitroApp)
})
