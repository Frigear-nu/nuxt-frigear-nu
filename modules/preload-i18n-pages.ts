import { defineNuxtModule, useNuxt } from '@nuxt/kit'
import { withLeadingSlash, withTrailingSlash, joinRelativeURL } from 'ufo'

export default defineNuxtModule({
  meta: {
    name: 'i18n-preload',
    configKey: 'i18nPreload',
  },
  hooks: {
    'nitro:config'(nitroConfig) {
      // TODO: add the path of a locale prefixed path to the prerender list.
      const nuxt = useNuxt()
      const i18nOptions = nuxt.options.i18n
      const defaultLocale = i18nOptions.defaultLocale
      nitroConfig.prerender = nitroConfig.prerender || {}
      nitroConfig.prerender.routes = nitroConfig.prerender.routes || []
      //
      const routes: string[] = []
      if (i18nOptions) {
        const localesToPrerender = i18nOptions.locales?.map((locale) => {
          return typeof locale === 'string' ? locale : locale.code
        })

        if (localesToPrerender) {
          for (const route in nitroConfig.prerender.routes) {
            if (!route) continue

            // Find all items without a locale prefix,
            // and add them to the prerender list with the non-default locale prefixes
            routes.push(
              ...localesToPrerender
                .filter((locale) => {
                  return locale !== defaultLocale
                  // Ensures that we can pre-render specific locale pages too.
                    && !route.startsWith(withLeadingSlash(withTrailingSlash(locale)))
                })
                .map((locale) => {
                  return withLeadingSlash(joinRelativeURL(locale, route))
                }),
            )
          }
        }
      }

      nitroConfig.prerender.routes.push(...(routes || []))
      // nitroConfig.prerender.routes.push('/sitemap.xml')
    },
  },
})
