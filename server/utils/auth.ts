import { createId } from '@paralleldrive/cuid2'
import type { Users } from 'hub:db:schema'
import type { H3Event } from 'h3'
import { encodeJwtRaw } from '@nitrotool/jwt/core'

export const createSafeId = () => createId()

export const authenticateUser = async (event: H3Event, user: Users, redirect?: string) => {
  const secret = useRuntimeConfig(event).jwtSecret
  await setUserSession(event, {
    user: {
      ...user,
      jwt: await encodeJwtRaw(user, secret),
    },
    loggedInAt: Date.now(),
  })

  return sendRedirect(event, redirect || '/')
}
