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
    '/account/**': {
      prerender: false,
    },
    // Redirects: should be removed in 2027 possibly.
    '/signin/password_signin': { redirect: { to: '/sign-in', statusCode: 301 } },
    '/signin/email_signin': { redirect: { to: '/sign-in?provider=link', statusCode: 301 } },
    '/signin/forgot_password': { redirect: { to: '/forgot-password', statusCode: 301 } },
    '/signin/signup': { redirect: { to: '/sign-up', statusCode: 301 } },
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
