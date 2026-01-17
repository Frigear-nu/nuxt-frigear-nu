import { createId } from '@paralleldrive/cuid2'
import type { Users } from 'hub:db:schema'
import type { H3Event } from 'h3'

export const createSafeId = () => createId()

export const authenticateUser = async (event: H3Event, user: Users, redirect?: string) => {
  await setUserSession(event, {
    user: {
      ...user,
      jwt: await encodeJwt(user),
    },
    loggedInAt: Date.now(),
  })

  return sendRedirect(event, redirect || '/')
}
