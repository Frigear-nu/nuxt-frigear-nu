import { createResolver } from '@nuxt/kit'
import vue from '@vitejs/plugin-vue'
import { getGitBranch } from 'simple-content-site/utils/git'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  extends: ['simple-content-site'],

  modules: [
    '@nitrotool/jwt',
    '@nuxthub/core',
    'nuxt-studio',
    '@nuxt/ui',
    '@nuxt/content',
    'nuxt-auth-utils',
    '@unlok-co/nuxt-stripe',
    'nuxt-resend',
    'nuxt-zod-i18n',
    '@nuxtjs/i18n',
    '@nuxtjs/device',
    '@pinia/nuxt',
    '@pinia/colada-nuxt',
    resolve('./modules/scs-i18n'),
    'nuxt-qrcode',
    '@sentry/nuxt/module',
    ...(import.meta.dev ? ['nuxt-component-meta'] : []),
    ...(import.meta.test ? ['@nuxt/test-utils/module'] : []),
  ],

  $production: {
    nitro: {
      scheduledTasks: {
        '*/30 * * * *': [
          'stripe:sync:supabase-users',
          'stripe:sync:products',
          'stripe:sync:prices',
          'stripe:sync:customers',
          'stripe:sync:subscriptions',
        ],
      },
      prerender: {
        routes: ['/', '/en'],
        failOnError: false,
        crawlLinks: false,
      },
    },

    hub: {
      blob: {
        driver: 'cloudflare-r2',
        binding: 'BLOB',
      },
    },
    image: {
      provider: 'cloudflare',
      quality: 80,
      format: ['webp', 'avif', 'jpeg', 'jpg', 'png', 'gif'],
      cloudflare: {
        baseURL: process.env.CLOUDFLARE_IMAGE_BASE_URL,
      },
    },
  },

  $test: {
    runtimeConfig: {
      session: {
        password: 'test-session-password-that-is-at-least-32-chars!!',
      },
    },
    sourcemap: false,
    nitro: {
      prerender: {
        failOnError: false,
      },
    },
    hub: {
      db: {
        applyMigrationsDuringBuild: false,
        dialect: 'sqlite',
        casing: 'snake_case',
      },
    },
    fonts: {
      providers: {
        bunny: false,
        fontshare: false,
        fontsource: false,
        google: false,
        googleicons: false,
      },
    },
    studio: false,
  },

  devtools: {
    timeline: {
      enabled: true,
    },
  },

  css: [resolve('./app/assets/css/main.css')],

  site: {
    name: 'Frigear.nu',
  },

  colorMode: {
    preference: 'dark',
  },

  content: {
    build: {
      transformers: [
        resolve('./transformers/object-variable-replacement'),
      ],
    },
    experimental: {
      sqliteConnector: 'native',
    },
  },

  ui: {
    colorMode: true,
    content: true,
    mdc: true,
    theme: {
      colors: [
        'primary',
        'secondary',
        'tertiary',
        'info',
        'neutral',
        'success',
        'warning',
        'error',
      ],
    },
  },

  runtimeConfig: {
    acl: {
      admins: '',
    },
    auth: {
      signUp: false,
      verifyEmail: true,
    },
    contact: {
      complaint: '',
      finance: '',
      governance: '',
      other: '',
      partnership: '',
      payment: '',
      support: '',
      volunteering: '',
    },
    jwtSecret: 'some-string-longer-than-32-chars-to-issue-jwt',
    mail: {
      from: '',
      to: '',
    },
    public: {
      sentry: {
        dsn: '',
        tracesSampleRate: 1.0,
      },
    },
    stripeWebhookSecret: '',
  },

  alias: {
    '#shared': resolve('./shared'),
  },

  routeRules: {
    '/account': { prerender: false },
    '/account/**': { prerender: false },
    '/admin/**': { prerender: false },
    '/api/_auth/**': { prerender: false },
    '/api/auth/**': { prerender: false },
    '/pricing': { redirect: { to: '/membership', statusCode: 301 } },
    '/sign-in': { prerender: false },
    '/sign-up': { prerender: false },
    '/signin/email_signin': { redirect: { to: '/sign-in?provider=link', statusCode: 301 } },
    '/signin/forgot_password': { redirect: { to: '/forgot-password', statusCode: 301 } },
    '/signin/password_signin': { redirect: { to: '/sign-in', statusCode: 301 } },
    '/signin/signup': { redirect: { to: '/sign-up', statusCode: 301 } },
  },

  sourcemap: { client: 'hidden' },

  compatibilityDate: '2025-12-11',

  nitro: {
    alias: {
      '#shared': resolve('./shared'),
    },
    experimental: {
      asyncContext: true,
      tasks: true,
    },
    rollupConfig: {
      plugins: [vue()],
    },
    scheduledTasks: {
      '*/30 * * * *': [
        'auth:clear-expired-password-resets',
        'auth:clear-expired-magic-links',
      ],
    },
    unenv: {
      external: ['node:async_hooks'],
    },
  },

  hub: {
    blob: true,
    db: {
      casing: 'snake_case',
      dialect: 'sqlite',
    },
  },

  vite: {
    optimizeDeps: {
      include: [
        'date-fns',
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'zod/v4',
        '@vueuse/core',
        'zod',
        '@internationalized/date',
        'nuxt-authorization/utils',
        '@nitrotool/errors',
      ],
    },
  },

  i18n: {
    defaultLocale: 'da',
    detectBrowserLanguage: false,
    experimental: {
      localeDetector: resolve('./i18n/localeDetector.ts'),
    },
    locales: [{
      code: 'da',
      name: 'Dansk',
    }, {
      code: 'en',
      name: 'English',
    }],
    strategy: 'prefix_except_default',
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
      contain: {
        modifiers: {
          fit: 'contain',
          format: 'webp',
        },
      },
      cover: {
        modifiers: {
          fit: 'cover',
          format: 'webp',
        },
      },
    },
  },

  ogImage: {
    emojiStrategy: 'fetch',
  },

  resend: {
    apiKey: process.env.NUXT_RESEND_API_KEY!,
  },

  scs: {
    experimental: {
      prerender: false,
    },
  },

  sentry: {
    authToken: process.env.NUXT_SENTRY_AUTH_TOKEN || process.env.SENTRY_AUTH_TOKEN || '',
    org: 'not-in-use-in-bugsink',
    project: 'not-in-use-in-bugsink',
    release: {
      create: false,
      finalize: false,
      inject: true,
      name: getGitBranch(),
    },
    sentryUrl: process.env.NUXT_SENTRY_URL!,
    sourceMapsUploadOptions: {
      authToken: process.env.NUXT_SENTRY_AUTH_TOKEN || process.env.SENTRY_AUTH_TOKEN || '',
      enabled: !!process.env.NUXT_SENTRY_AUTH_TOKEN && !!process.env.NUXT_SENTRY_URL,
      url: process.env.NUXT_SENTRY_URL,
    },
  },

  stripe: {
    client: {
      key: process.env.STRIPE_PUBLISHABLE_KEY!,
      manualClientLoad: true,
      options: {},
    },
    server: {
      key: process.env.STRIPE_SECRET_KEY!,
      options: {},
    },
  },

  studio: {
    dev: false,
    repository: {
      branch: process.env.STUDIO_GITHUB_BRANCH_NAME || 'main',
      owner: 'Frigear-nu',
      private: false,
      provider: 'github',
      repo: 'nuxt-frigear-nu',
    },
  },

  zodI18n: {
    localeCodesMapping: {
      'da-DK': 'da',
      'en-GB': 'en',
    },
  },
})
