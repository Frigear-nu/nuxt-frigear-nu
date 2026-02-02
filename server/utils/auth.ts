import { createId } from '@paralleldrive/cuid2'
import type { Users } from 'hub:db:schema'
import type { H3Event } from 'h3'
import type { ExtendableJwtPayload } from '@nitrotool/jwt/core'
import { UnauthenticatedError } from '@nitrotool/errors'

export const createSafeId = () => createId()

export const authenticateUser = async (event: H3Event, user: Users, redirect?: string) => {
  await setUserSession(event, {
    user: await mapUserToSession(user),
    loggedInAt: Date.now(),
  })

  if (!redirect) {
    return { ok: true }
  }

  return sendRedirect(event, redirect || '/')
}

export const mapUserToSession = async (user: Users) => {
  return ({
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerifiedAt: user.emailVerifiedAt,
    avatarUrl: user.avatarUrl,
    // Supabase: these will at some point go away.
    isMigrated: user.isMigrated,
    sbId: user.supabaseId || undefined,
    // todo: maybe issue JWT here?
  })
}

export const mapUserToJwt = (user: Users): ExtendableJwtPayload => ({
  sub: `${user.id}`,
// todo: investigate what we need here.
})

export const requireUserId = async (event: H3Event): Promise<number> => {
  // Priority 1: Session
  if (event.context.$user && event.context.$user.id) {
    return event.context.$user.id
  }

  // Priority 2: JWT
  if (event.context.$jwt && event.context.$jwt.sub) {
    if (Number.isNaN(Number(event.context.$jwt.sub))) {
      throw new TypeError('Invalid JWT subject.')
    }
    return Number(event.context.$jwt.sub)
  }

  //
  throw UnauthenticatedError('UserId required')
}

export const requireUser = async (event: H3Event) => {
  if (event.context.$user && event.context.$user) {
    return event.context.$user
  }

  if (event.context.$jwt && event.context.$jwt.sub) {
    if (Number.isNaN(Number(event.context.$jwt.sub))) {
      throw new TypeError('Invalid JWT subject.')
    }
    const user = await findUserById(Number(event.context.$jwt.sub))
    if (!user) throw UnauthenticatedError('User required')
    return mapUserToSession(user)
  }

  //
  throw UnauthenticatedError('User required')
}
