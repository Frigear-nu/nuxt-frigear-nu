export default defineNuxtConfig({
  extends: ['simple-content-site'],
  modules: [
    '@nuxthub/core',
    '@nuxtjs/supabase',
    'nuxt-studio',
    '@nuxt/content',
    '@nuxt/ui',
    '@unlok-co/nuxt-stripe',
    'nuxt-resend',
    '@nuxtjs/i18n',
  ],
  $production: {
    image: {
      cloudflare: {
        baseURL: process.env.CLOUDFLARE_IMAGE_BASE_URL,
      },
      quality: 80,
    },
  },
  css: ['~/assets/css/main.css'],
  site: {
    name: 'Frigear.nu',
  },
  colorMode: {
    preference: 'dark',
  },
  runtimeConfig: {
    stripeWebhookSecret: '',
    resend: {
      apiKey: '',
    },
    mail: {
      from: '',
      to: '',
    },
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
    db: 'sqlite',
  },
  i18n: {
    defaultLocale: 'da',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: false, // otherwise we get issues with redirect.
    experimental: {
      localeDetector: 'localeDetector.ts',
    },
    locales: [{
      code: 'da',
      name: 'Dansk',
    }, {
      code: 'en',
      name: 'English',
    }],
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
