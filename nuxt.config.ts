export default defineNuxtConfig({
  extends: ['simple-content-site'],
  modules: [
    '@nuxthub/core',
    '@nuxtjs/supabase',
    '@nuxt/content',
    'nuxt-studio',
    '@nuxt/ui',
    'nuxt-auth-utils',
    '@unlok-co/nuxt-stripe',
  ],
  css: ['~/assets/css/main.css'],
  site: {
    name: 'Frigear.nu',
  },
  colorMode: {
    preference: 'dark',
  },
  runtimeConfig: {
    jwtSecret: 'some-string-longer-than-32-chars-to-issue-jwt',
    stripeWebhookSecret: '',
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
  hub: {
    db: {
      dialect: 'sqlite',
      casing: 'snake_case',
    },
  },
  stripe: {
    server: {
      key: process.env.STRIPE_SECRET_KEY!,
      options: {/* https://github.com/stripe/stripe-node?tab=readme-ov-file#configuration */},
    },
    client: {
      key: process.env.STRIPE_PUBLISHABLE_KEY!,
      manualClientLoad: true,
      options: { /* your api options override for stripe client side https://stripe.com/docs/js/initializing#init_stripe_js-options */},
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
