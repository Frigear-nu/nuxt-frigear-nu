import { addServerHandler, addServerImportsDir, createResolver, defineNuxtModule, extendPages } from '@nuxt/kit'
import type { OAuthServerModuleOptions } from './types'
import { defu } from 'defu'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtModule<OAuthServerModuleOptions>({
  meta: {
    name: 'oauth-server',
    configKey: 'oauthServer',
  },
  defaults: {
    jwtPrivateKey: '',
    jwtPublicKey: '',
  },
  async setup(moduleOptions, nuxt) {
    nuxt.options.runtimeConfig.oauthServer = defu(nuxt.options.runtimeConfig.oauthServer, moduleOptions) as OAuthServerModuleOptions

    // App
    extendPages((pages) => {
      if (pages.some(p => p.path === '/authorize')) {
        return
      }

      pages.push({
        name: 'oauth-authorize',
        path: '/authorize',
        file: resolve('./runtime/app/pages/authorize.vue'),
      })
    })

    // Server
    addServerImportsDir([
      resolve('./runtime/server/utils'),
    ])

    addServerHandler({
      method: 'get',
      route: '/.well-known/jwks.json',
      handler: resolve('./runtime/server/routes/.well-known/jwks.json.get.ts'),
    })

    addServerHandler({
      method: 'get',
      route: '/.well-known/openid-configuration',
      handler: resolve('./runtime/server/routes/.well-known/openid-configuration.get.ts'),
    })

    addServerHandler({
      method: 'get',
      route: '/oauth/authorize',
      handler: resolve('./runtime/server/routes/oauth/authorize.get.ts'),
    })

    addServerHandler({
      method: 'post',
      route: '/oauth/authorize',
      handler: resolve('./runtime/server/routes/oauth/authorize.post.ts'),
    })

    addServerHandler({
      method: 'post',
      route: '/oauth/token',
      handler: resolve('./runtime/server/routes/oauth/token.post.ts'),
    })

    addServerHandler({
      method: 'post',
      route: '/oauth/revoke',
      handler: resolve('./runtime/server/routes/oauth/revoke.post.ts'),
    })

    addServerHandler({
      method: 'get',
      route: '/oauth/userinfo',
      handler: resolve('./runtime/server/routes/oauth/userinfo.get.ts'),
    })
  },
})
