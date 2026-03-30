import { defineNitroPlugin } from 'nitropack/runtime'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('robots:robots-txt', (ctx) => {
    const hostName = getRequestHost(ctx.e)
    if (hostName.startsWith('staging')) {
      ctx.robotsTxt += `\n#host=${hostName}\n`
      return
    }

    const bannedPaths = [
      '/admin',
      '/admin/*',
      '/api',
      '/api/*',
      '/auth/*',
    ]

    ctx.robotsTxt = [
      `#${hostName}`,
      'User-agent: *',
      ...bannedPaths.map(path => `Disallow: ${path}`),
    ].join('\n')
  })
})
