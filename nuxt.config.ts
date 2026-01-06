export default defineNuxtConfig({
  modules: ['nuxt-studio', '@nuxt/ui', '@nuxt/content'],
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
      public: true,
    },
  },

})
