import { extractApiToken } from '@nitrotool/jwt/h3'

export default defineEventHandler(async (event) => {
  const token = extractApiToken(event, {
    queryKey: 'token',
  })
  //
  if (token) {
    event.context.$jwt = await decodeJwt(token)
  }

  const { user } = await getUserSession(event)

  if (user) {
    event.context.$user = user
  }
})
