export default defineNuxtConfig({
  extends: ['simple-content-site'],
  modules: ['@nuxt/content', 'nuxt-studio', '@nuxt/ui', '@nuxtjs/supabase'],
  css: ['~/assets/css/main.css'],
  site: {
    name: 'Frigear.nu',
  },
  colorMode: {
    preference: 'dark',
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
    redirectOptions: {
      login: '/sign-in',
      callback: '/auth/confirm',
      // todo: naming?
      include: ['/account(/*)?'],
      saveRedirectToCookie: true,
    },
  },
})
