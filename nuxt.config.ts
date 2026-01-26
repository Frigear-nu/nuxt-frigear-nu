import vue from '@vitejs/plugin-vue'

export default defineNuxtConfig({
  extends: ['simple-content-site'],
  modules: [
    '@nitrotool/jwt',
    '@nuxthub/core',
    '@nuxtjs/supabase',
    'nuxt-studio',
    '@nuxt/ui',
    '@nuxt/content',
    'nuxt-auth-utils',
    '@unlok-co/nuxt-stripe',
    'nuxt-resend',
    'nuxt-zod-i18n',
    '@nuxtjs/i18n',
    '@nuxtjs/device',
  ],
  $production: {
    image: {
      provider: 'cloudflare',
      quality: 80,
      format: ['webp', 'avif', 'jpeg', 'jpg', 'png', 'gif'],
      cloudflare: {
        baseURL: process.env.CLOUDFLARE_IMAGE_BASE_URL,
      },
    },
  },
  css: ['~/assets/css/main.css'],
  site: {
    name: 'Frigear.nu',
  },
  colorMode: {
    preference: 'dark',
  },
  content: {
    experimental: {
      sqliteConnector: 'native',
    },
  },
  runtimeConfig: {
    jwtSecret: 'some-string-longer-than-32-chars-to-issue-jwt',
    stripeWebhookSecret: '',
    mail: {
      from: '',
      to: '',
    },
    auth: {
      verifyEmail: true,
      signUp: false,
    },
    contact: {
      volunteering: '',
      partnership: '',
      support: '',
      payment: '',
      governance: '',
      finance: '',
      complaint: '',
      other: '',
    },
  },
  routeRules: {
    '/sign-in': { prerender: false },
    '/account': { prerender: false },
    '/account/**': { prerender: false },
    // Static Redirects
    '/sign-up': { redirect: { to: '/sign-in?mode=up' } },
    // Temporary Redirects: should be removed in 2027 possibly.
    '/signin/password_signin': { redirect: { to: '/sign-in', statusCode: 301 } },
    '/signin/email_signin': { redirect: { to: '/sign-in?provider=link', statusCode: 301 } },
    '/signin/forgot_password': { redirect: { to: '/forgot-password', statusCode: 301 } },
    '/signin/signup': { redirect: { to: '/sign-in?mode=up', statusCode: 301 } },
    '/pricing': { redirect: { to: '/membership', statusCode: 301 } },

    // API
    '/api/_auth/**': { prerender: false },
    '/api/auth/**': { prerender: false },
  },
  compatibilityDate: '2025-12-11',
  nitro: {
    experimental: {
      tasks: true,
      asyncContext: true,
    },
    unenv: {
      external: ['node:async_hooks'],
    },
    rollupConfig: {
      // @ts-expect-error This fails due to not having types
      plugins: [vue()],
    },
    scheduledTasks: {
      // every 30 min
      '*/30 * * * *': [
        'auth:clear-expired-password-resets',
        'auth:clear-expired-magic-links',
      ],
    },
  },
  hub: {
    db: {
      dialect: 'sqlite',
      casing: 'snake_case',
    },
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
  image: {
    presets: {
      avatar: {
        modifiers: {
          format: 'webp',
          height: 128,
          width: 128,
        },
      },
    },
  },
  ogImage: {
    zeroRuntime: true,
    // @ts-expect-error Not sure why this is not typed: https://nuxtseo.com/docs/og-image/guides/emojis
    emojiStrategy: 'fetch',
  },
  resend: {
    apiKey: process.env.NUXT_RESEND_API_KEY!,
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
      include: [
        /* '/account(/*)?', */
        '/only/supabase',
      ],
      saveRedirectToCookie: true,
    },
  },
  zodI18n: {
    localeCodesMapping: {
      'da-DK': 'da',
      'en-GB': 'en',
    },
  },
})
