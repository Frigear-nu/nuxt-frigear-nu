import { createId } from '@paralleldrive/cuid2'
import type { Users } from 'hub:db:schema'
import type { H3Event } from 'h3'

export const createSafeId = () => createId()

export const authenticateUser = async (event: H3Event, user: Users, redirect?: string) => {
  await setUserSession(event, {
    // todo: decide on structure here:
    //  - Might be enough with only a few details, e.g id,name,email
    user: {
      ...user,
      jwt: await encodeJwt(user),
      emailVerified: !!user?.emailVerifiedAt,
    },
    loggedInAt: Date.now(),
  })

  return sendRedirect(event, redirect || '/')
}
