import { defineNuxtModule /* ,useNuxt */ } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'i18n-preload',
    configKey: 'i18nPreload',
  },
  hooks: {
    'nitro:config'(
      // nitroConfig
    ) {
      // TODO: add the path of a locale prefixed path to the prerender list.
      // const nuxt = useNuxt()
      //
      // const i18nOptions = nuxt.options.i18n
      //
      // const routes: string[] = []
      // if (!i18nOptions) {
      //   routes.push('/')
      // }
      // else {
      //   routes.push(...(i18nOptions.locales?.map(locale => typeof locale === 'string' ? `/${locale}` : `/${locale.code}`) || []))
      // }
      //
      // nitroConfig.prerender = nitroConfig.prerender || {}
      // nitroConfig.prerender.routes = nitroConfig.prerender.routes || []
      // nitroConfig.prerender.routes.push(...(routes || []))
      /// / nitroConfig.prerender.routes.push('/sitemap.xml')
    },
  },
})
