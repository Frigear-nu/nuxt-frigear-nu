import { magicLinkSchema } from '#shared/schema/auth'
import { useValidatedBody } from 'h3-zod'
import { ClientError, NotFoundError } from '@nitrotool/errors'
import { addMinutes } from 'date-fns'
import { db } from 'hub:db'
import { eq } from 'drizzle-orm'
import { withQuery } from 'ufo'

export default defineEventHandler(async (event) => {
  const { email, redirect } = await useValidatedBody(event, magicLinkSchema)

  console.log(email)

  const resolvedUser = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  })

  if (!resolvedUser) throw NotFoundError()

  // todo: rate-limit this.

  const token = createSafeId()
  const expiresAt = addMinutes(new Date(), 120)
  const [createdMagicLink] = await db.insert(schema.magicLinks).values({
    token,
    expiresAt: expiresAt,
    userId: resolvedUser.id,
  }).returning()

  if (!createdMagicLink) throw ClientError('Could not create magic link.')

  const signInUrl = withBaseUrl(withQuery('/auth/magic-link', { token, redirect: redirect || '/auth/confirm' }))
  if (import.meta.dev) {
    logger.success(`Sign in with this URL: ${signInUrl}`)
    return {
      message: 'Success',
      expiresAt,
      local: true,
    }
  }

  // todo: send email with link
  return {
    message: 'Success',
    expiresAt,
    redirect,
  }
})
