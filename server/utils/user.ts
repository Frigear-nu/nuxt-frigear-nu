import type { H3Event } from 'h3'
import type { Users, NewUsers } from '@nuxthub/db/schema'
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
  return user?.emailVerifiedAt ? continueLink : '/auth/confirm'
}

export const findUserByEmail = (email: Users['email']): Promise<Users | undefined> => {
  return db.query.users.findFirst({ where: () => eq(schema.users.email, email) })
}

export const findUserById = (id: Users['id']): Promise<Users | undefined> => {
  return db.query.users.findFirst({ where: () => eq(schema.users.id, id) })
}

export const createOrUpdateUser = async (
  email: Users['email'],
  fields: Partial<Omit<NewUsers, 'email'>>,
) => {
  if (!email) {
    throw new Error('Email is required')
  }

  if (!fields.name) {
    throw new Error('Name is required')
  }

  const [user] = await db.insert(schema.users)
    .values({ email, ...fields } as NewUsers)
    .onConflictDoUpdate({
      target: schema.users.email,
      set: fields,
    })
    .returning()

  if (!user) {
    throw new Error('Could not create user')
  }

  return user
}
