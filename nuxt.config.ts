export default defineNuxtConfig({
  extends: ['simple-content-site'],
  modules: ['@nuxtjs/supabase', '@nuxt/content', 'nuxt-studio', '@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  site: {
    name: 'Frigear.nu',
  },
  colorMode: {
    preference: 'dark',
  },
  routeRules: {
    '/sign-in': {
      prerender: false,
    },
    '/sign-up': {
      prerender: false,
    },
    '/account': {
      prerender: false,
    },
  },
  nitro: {
    cloudflare: {
      nodeCompat: true,
      deployConfig: true,
    },
  },
  studio: {
    repository: {
      provider: 'github',
      owner: 'Frigear-nu',
      repo: 'nuxt-frigear-nu',
      branch: process.env.STUDIO_GITHUB_BRANCH_NAME || 'main',
      private: false,
    },
  },

  supabase: {
    useSsrCookies: true,
    redirectOptions: {
      login: '/sign-in',
      callback: '/auth/confirm',
      // todo: naming?
      include: ['/account(/*)?'],
      saveRedirectToCookie: true,
    },
  },
})
