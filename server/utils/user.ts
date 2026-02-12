import type { H3Event } from 'h3'
import type { Users } from '@nuxthub/db/schema'
import { db, schema } from '@nuxthub/db'
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

export const findUserByEmail = (email: Users['email']): Promise<Users | undefined> => {
  return db.query.users.findFirst({ where: () => eq(schema.users.email, email) })
}

export const findUserById = (id: Users['id']): Promise<Users | undefined> => {
  return db.query.users.findFirst({ where: () => eq(schema.users.id, id) })
}
