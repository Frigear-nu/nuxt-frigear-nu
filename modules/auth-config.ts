import { defineNuxtModule } from '@nuxt/kit'
import { defu } from 'defu'

export default defineNuxtModule({
  meta: {
    name: 'auth-config',
    configKey: 'authConfig',
  },
  async setup(_, nuxtApp) {
    // expose to public runtimeConfig
    nuxtApp.options.runtimeConfig.public.auth = defu(nuxtApp.options.runtimeConfig.public.auth, nuxtApp.options.runtimeConfig.auth, {
      verifyEmail: true,
      signUp: false,
    })
  },
})
