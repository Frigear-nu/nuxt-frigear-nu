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
            owner: 'Frigear-nu',
            repo: 'nuxt-frigear-nu',
            branch: process.env.STUDIO_GITHUB_BRANCH_NAME || 'main',
        },
    },
})
