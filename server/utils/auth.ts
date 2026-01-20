import { createId } from '@paralleldrive/cuid2'
import type { Users } from 'hub:db:schema'
import type { H3Event } from 'h3'
import type { ExtendableJwtPayload } from '@nitrotool/jwt/core'

export const createSafeId = () => createId()

export const authenticateUser = async (event: H3Event, user: Users, redirect?: string) => {
  await setUserSession(event, {
    user: await mapUserToSession(user),
    loggedInAt: Date.now(),
  })

  return sendRedirect(event, redirect || '/')
}

export const mapUserToSession = async (user: Users) => {
  return ({
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerifiedAt: user.emailVerifiedAt,
    avatarUrl: user.avatarUrl,
    // todo: maybe issue JWT here?
  })
}

export const mapUserToJwt = (user: Users): ExtendableJwtPayload => ({
  sub: `${user.id}`,
// todo: investigate what we need here.
})
