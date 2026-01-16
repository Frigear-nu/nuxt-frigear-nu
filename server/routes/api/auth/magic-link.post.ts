import { magicLinkSchema } from '#shared/schema/auth'
import { useValidatedBody } from 'h3-zod'
import { ClientError, NotFoundError } from '@nitrotool/errors'
import { addMinutes } from 'date-fns'
import { db } from 'hub:db'

export default defineEventHandler(async (event) => {
  const { email, redirect } = await useValidatedBody(event, magicLinkSchema)

  // @ts-expect-error Drizzle has some bugs with types
  const resolvedUser = await db.query.users.findFirst({ where: { email } })

  if (!resolvedUser) throw NotFoundError()

  // todo: rate-limit this.

  const token = createSafeId()
  const expiresAt = addMinutes(new Date(), 120)
  const [createdMagicLink] = await db.insert(schema.magicLinks).values({
    token,
    expiresAt,
    userId: resolvedUser.id,
  }).returning()

  if (!createdMagicLink) throw ClientError('Could not create magic link.')

  const signInUrl = withBaseUrl(`/auth/magic-link?token=${token}${redirect ? `&redirect=${redirect}` : ''}`)
  if (import.meta.dev) {
    console.log(`Sign in with this URL: ${signInUrl}`)
  }
  else {
    // todo: send email with link
  }

  return {
    message: 'Success',
    expiresAt,
    redirect,
  }
})
