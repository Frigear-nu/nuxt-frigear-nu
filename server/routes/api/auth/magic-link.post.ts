import { magicLinkSchema } from '#shared/schema/auth'
import { useValidatedBody } from 'h3-zod'
import { ClientError, NotFoundError } from '@nitrotool/errors'
import { addMinutes } from 'date-fns'
import { db } from 'hub:db'
import { eq } from 'drizzle-orm'
import { withQuery } from 'ufo'

export default defineEventHandler(async (event) => {
  const { mail: { from } } = useRuntimeConfig(event)
  const { email, redirect } = await useValidatedBody(event, magicLinkSchema)

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
    redirectUrl: redirect,
  }).returning()

  if (!createdMagicLink) throw ClientError('Could not create magic link.')

  const signInUrl = withBaseUrl(withQuery('/auth/magic-link', { token }))
  if (import.meta.dev) {
    logger.success(`Sign in with this URL: ${signInUrl}`)
    return {
      message: 'Success',
      expiresAt,
      local: true,
    }
  }

  await sendEmail(event, {
    to: email,
    from,
    subject: 'Magic Link',
    html: `<a href="${signInUrl}">Sign in by clicking here</a> or copy this URL into a browser to sign in: ${signInUrl}`,
    replyTo: email,
  })

  return {
    message: 'Success',
    expiresAt,
    redirect,
  }
})
