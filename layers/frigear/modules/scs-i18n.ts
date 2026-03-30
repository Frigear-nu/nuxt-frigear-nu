import { defineNuxtModule, createResolver } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'scs-i18n',
    configKey: 'scsI18n',
  },
  async setup(_, nuxtApp) {
    const { resolve } = createResolver(import.meta.url)

    const filteredLocales = nuxtApp.options.i18n?.locales || []
    nuxtApp.hook('i18n:registerModule', (register) => {
      const langDir = resolve('../i18n/locales')

      const locales = filteredLocales?.map((locale) => {
        return typeof locale === 'string'
          ? {
              code: locale,
              name: locale,
              file: `${locale}.json`,
            }
          : {
              code: locale.code,
              name: locale.name || locale.code,
              file: `${locale.code}.json`,
            }
      })

      register({
        langDir,
        locales,
      })
    })
  },
})
