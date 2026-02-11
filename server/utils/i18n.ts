import type { H3Event } from 'h3'

export const isDefaultLocale = (event: H3Event, locale: string) => {
  return useRuntimeConfig(event).public.i18n.defaultLocale === locale
}

export const isSupportedLocale = (event: H3Event, locale: string) => {
  return useRuntimeConfig(event).public.i18n.locales.some((l) => {
    if (typeof l === 'string') return l === locale
    // @ts-expect-error Not sure why this is not typed
    return l?.code === locale
  })
}
