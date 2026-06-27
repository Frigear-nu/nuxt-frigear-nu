import { extractApiToken } from '@nitrotool/jwt/h3'

export default defineEventHandler(async (event) => {
  const requestPath = event.path

  //
  if (requestPath.startsWith('/oauth')
    || !requestPath.startsWith('/api/')
    || requestPath.startsWith('/api/_')
  ) {
    return
  }

  const { user } = await getUserSession(event)

  if (user && user.id) {
    event.context.$user = user
  }

  const accessToken = extractApiToken(event, {
    queryKey: 'access_token',
  })

  if (accessToken) {
    const config = useRuntimeConfig(event)
    const baseUrl = getRequestURL(event).origin
    event.context.$jwt = await verifyJWT(accessToken, normalizePemKey(config.jwtPublicKey), {
      issuer: baseUrl,
    }) as never
  }
})
