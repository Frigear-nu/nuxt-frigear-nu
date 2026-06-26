import { extractApiToken } from '@nitrotool/jwt/h3'
import { db } from '@nuxthub/db'

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

  if (!accessToken) {
    throw createError({
      status: 401,
      message: 'Missing token.',
    })
  }

  event.context.$jwt = await decodeJwt(accessToken)
})
