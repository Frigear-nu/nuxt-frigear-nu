import { extractApiToken } from '@nitrotool/jwt/h3'

export default defineEventHandler(async (event) => {
  // FIXME: This should only be triggered if there isa  valid token...
  // This still will trigger on the ?token items we have - they should be renamed to code
  const accessToken = extractApiToken(event, {
    queryKey: 'access_token',
  })

  if (accessToken) {
    event.context.$jwt = await decodeJwt(accessToken)
  }

  const { user } = await getUserSession(event)

  if (user) {
    event.context.$user = user
  }
})
