export default defineNuxtConfig({
  extends: ['simple-content-site'],
  modules: [
    '@nuxthub/core',
    '@nuxtjs/supabase',
    '@nuxt/content',
    'nuxt-studio',
    '@nuxt/ui',
  ],
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
    '/account': {
      prerender: false,
    },
    '/account/**': {
      prerender: false,
    },

    // Static Redirects
    '/sign-up': { redirect: { to: '/sign-in?mode=up' } },

    // Temporary Redirects: should be removed in 2027 possibly.
    '/signin/password_signin': { redirect: { to: '/sign-in', statusCode: 301 } },
    '/signin/email_signin': { redirect: { to: '/sign-in?provider=link', statusCode: 301 } },
    '/signin/forgot_password': { redirect: { to: '/forgot-password', statusCode: 301 } },
    '/signin/signup': { redirect: { to: '/sign-in?mode=up', statusCode: 301 } },
    '/pricing': { redirect: { to: '/membership', statusCode: 301 } },
  },
  compatibilityDate: '2025-12-11',
  nitro: {
    cloudflare: {
      wrangler: {
        routes: [
          { custom_domain: true, pattern: 'nuxt.frigear.nu' },
          { custom_domain: true, pattern: 'nuxt.frigear.dev' },
        ],

      },
    },
  },
  hub: {
    db: {
      dialect: 'sqlite',
      driver: 'd1',
      connection: { databaseId: '03188510-ac62-4ffb-80dd-0d9912aa3d55' },
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
