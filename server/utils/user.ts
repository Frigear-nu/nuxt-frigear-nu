import type { H3Event } from 'h3'
import type { Users } from 'hub:db:schema'
import { eq } from 'drizzle-orm'

export const getDefaultRedirectForUser = async (
  event: H3Event,
  user: Pick<Users, 'emailVerifiedAt'>,
  redirect?: string,
) => {
  const { verifyEmail } = useRuntimeConfig(event).auth
  const defaultRedirect = '/account'
  const continueLink = redirect && isInternalUrl(redirect)
    ? redirect
    : defaultRedirect

  if (!verifyEmail) {
    return continueLink
  }
  return user?.emailVerifiedAt ? continueLink : '/auth/verify-email'
}

export const findUserByEmail = (email: Users['email']): Promise<Users | null> => {
  // @ts-expect-error There is some typing issue with drizzle for now
  return db.query.users.findFirst({ where: eq(schema.users.email, email) })
}

export const findUserById = (id: Users['id']): Promise<Users | null> => {
  // @ts-expect-error There is some typing issue with drizzle for now
  return db.query.users.findFirst({ where: eq(schema.users.id, id) })
}
