export default defineNuxtConfig({
  modules: ['nuxt-studio'],
  nitro: {
    cloudflare: {
      nodeCompat: true,
      deployConfig: true,
    },
  },
    site: {
      name: 'Frigear.nu',
    },
  studio: {
    repository: {
      provider: 'github',
      owner: 'hareland',
      repo: 'hareland-eu',
      branch: process.env.STUDIO_GITHUB_BRANCH_NAME || 'main',
    },
  },
})
