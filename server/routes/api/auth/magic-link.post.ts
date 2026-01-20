import { magicLinkSchema } from '#shared/schema/auth'
import { useValidatedBody } from 'h3-zod'
import { ClientError, NotFoundError } from '@nitrotool/errors'
import { addMinutes } from 'date-fns'
import { db } from 'hub:db'
import { eq } from 'drizzle-orm'
import { withQuery } from 'ufo'

export default defineEventHandler(async (event) => {
  const { mail: { from, to: replyTo } } = useRuntimeConfig(event)
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
    console.log(`Sign in with this URL: ${signInUrl}`)
    return {
      message: 'Success',
      expiresAt,
      local: true,
    }
  }

  await sendEmailTemplate(event, {
    to: email,
    from,
    replyTo,
    subject: 'Magic Link',
    template: 'AuthMagicLinkEmail',
    props: {
      magicLink: signInUrl,
    },
  })

  return {
    message: 'Success',
    expiresAt,
    redirect,
  }
})
