import { signInWithMagicLinkSchema } from '#shared/schema/auth'
import { useValidatedBody } from 'h3-zod'
import { ClientError, NotFoundError } from '@nitrotool/errors'
import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import MagicLinkEmail from '#shared/emails/auth/MagicLinkEmail.vue'

export default defineEventHandler(async (event) => {
  const { mail: { from, to: replyTo }, auth: { signUp } } = useRuntimeConfig(event)
  const { email, redirect } = await useValidatedBody(event, signInWithMagicLinkSchema)

  let resolvedUser = await db.query.users.findFirst({
    where: () => eq(schema.users.email, email),
  })

  if (!resolvedUser) {
    if (!signUp) throw NotFoundError()

    const [createdUser] = await db
      .insert(schema.users)
      .values({
        name: email,
        email,
      })
      .returning()

    if (!createdUser) throw ClientError('Could not create user. Please try again later.')

    resolvedUser = createdUser
  }

  // todo: rate-limit this.
  const { url: signInUrl } = await createMagicLinkForUser({
    userId: resolvedUser.id,
    redirectUrl: redirect && isInternalUrl(redirect) ? redirect : undefined,
  })

  if (import.meta.dev) {
    console.log(`Sign in with this URL: ${signInUrl}`)
    return {
      message: 'Success',
      local: true,
    }
  }
  //
  await sendEmailTemplate(event, {
    to: email,
    from,
    replyTo,
    subject: 'Magic Link',
    component: MagicLinkEmail,
    props: {
      signInUrl,
    },
  })

  return {
    message: 'Success',
    redirect,
  }
})
