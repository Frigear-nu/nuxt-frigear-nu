import { defineNuxtModule, useNuxt, useRuntimeConfig } from '@nuxt/kit'
import { defu } from 'defu'

export default defineNuxtModule({
  meta: {
    name: 'auth-config',
    configKey: 'authConfig',
  },

  hooks: {
    'modules:done': () => {
      const nuxtApp = useNuxt()
      const runtimeConfig = nuxtApp.options.runtimeConfig
      runtimeConfig.public.auth = defu(runtimeConfig.public.auth, runtimeConfig.auth, {
        verifyEmail: true,
        signUp: false,
        providers: [],
      })

      // Somehow we cannot read this directly from runtimeConfig from the nuxt instance...
      const rc = useRuntimeConfig()
      if (rc?.oauth?.google?.clientId) {
        runtimeConfig.public.auth.providers.push('google')
      }

      if (rc?.oauth?.facebook?.clientId) {
        runtimeConfig.public.auth.providers.push('facebook')
      }

      if (rc?.oauth?.apple?.clientId) {
        runtimeConfig.public.auth.providers.push('apple')
      }
    },
  },
})
