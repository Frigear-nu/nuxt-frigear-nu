import { defineNuxtModule, useNuxt, logger } from '@nuxt/kit'
import { withLeadingSlash, withoutTrailingSlash, joinRelativeURL } from 'ufo'

const log = logger.withTag('i18n-preload')

/**
 * This module
 */
export default defineNuxtModule({
  meta: {
    name: 'i18n-preload',
    configKey: 'i18nPreload',
  },
  hooks: {
    'nitro:config'(nitroConfig) {
      if (nitroConfig.dev) {
        log.warn('Not initializing prerender, dev: true')
        return
      }
      const nuxt = useNuxt()
      const i18nOptions = nuxt.options.i18n
      const defaultLocale = i18nOptions.defaultLocale
      nitroConfig.prerender = nitroConfig.prerender || {}
      nitroConfig.prerender.routes = nitroConfig.prerender.routes || []
      // TODO: We should probably include common pages to NOT be pre-rendered,
      // this must include the locale prefix too otherwise it will still prerender those paths.
      nitroConfig.prerender.ignore = nitroConfig.prerender.ignore || []

      if (i18nOptions) {
        const routesToPrerender = new Set<string>()
        const locales = i18nOptions.locales?.map(locale =>
          typeof locale === 'string' ? locale : locale.code,
        )

        if (locales) {
          for (const route of nitroConfig.prerender.routes) {
            if (!route) continue

            // Skip routes that are just a locale code (e.g. "/da", "/en")
            const isLocaleRoute = locales.some(
              locale => withLeadingSlash(locale) === route,
            )
            if (isLocaleRoute) continue

            const candidates = locales
              .filter((locale) => {
                return (
                  // not default locale
                  locale !== defaultLocale
                  // todo: this might be wrong for some routes...
                  && !route.startsWith(withLeadingSlash(locale) + '/')
                )
              })
              .map((locale) => {
                const prefixed = withLeadingSlash(joinRelativeURL(locale, route))
                if (prefixed === '/') {
                  return prefixed
                }

                return withoutTrailingSlash(prefixed)
              })

            for (const candidate of candidates) {
              routesToPrerender.add(candidate)
            }
          }
        }

        nitroConfig.prerender.routes = [...new Set([
          ...nitroConfig.prerender.routes,
          ...routesToPrerender,
        ])]

        if (nuxt.options.dev) {
          console.log('routes to prerender: ', nitroConfig.prerender.routes)
        }
      }
    },
  },
})
