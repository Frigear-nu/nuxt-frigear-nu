import { defineNuxtModule, useNuxt, logger } from '@nuxt/kit'
import { withLeadingSlash, withoutTrailingSlash, joinRelativeURL } from 'ufo'

const log = logger.withTag('i18n-prerender')

/**
 * This module
 */
export default defineNuxtModule({
  meta: {
    name: 'i18n-prerender',
    configKey: 'i18nPrerender',
  },
  hooks: {
    'nitro:config'(nitroConfig) {
      const nuxt = useNuxt()
      if (nuxt.options.dev) {
        log.warn('Not initializing prerender, dev: true')
        return
      }

      const i18nOptions = nuxt.options.i18n
      if (!i18nOptions) {
        log.warn('No i18n options found, skipping prerender route generation')
        return
      }

      const defaultLocale = i18nOptions.defaultLocale
      nitroConfig.prerender = nitroConfig.prerender || {}
      nitroConfig.prerender.routes = nitroConfig.prerender.routes || []
      // TODO: We should probably include common pages to NOT be pre-rendered,
      // this must include the locale prefix too otherwise it will still prerender those paths.
      nitroConfig.prerender.ignore = nitroConfig.prerender.ignore || []

      const routesToPrerender = new Set<string>()
      const localeCodes = i18nOptions.locales?.map(locale =>
        typeof locale === 'string' ? locale : locale.code,
      )

      if (!localeCodes) {
        log.warn('No locales found: skipping.')
        return
      }

      for (const route of nitroConfig.prerender.routes) {
        // skip the default locale root page. e.g `/da`
        if (!route || route === withLeadingSlash(defaultLocale)) continue

        const candidates = localeCodes
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
            return prefixed === '/'
              ? prefixed
              : withoutTrailingSlash(prefixed)
          })

        for (const candidate of candidates) {
          routesToPrerender.add(candidate)
        }
      }

      nitroConfig.prerender.routes = [...new Set([
        ...nitroConfig.prerender.routes,
        ...routesToPrerender,
      ])]

      console.log('routes to prerender: ', nitroConfig.prerender.routes)
    },
  },
})
