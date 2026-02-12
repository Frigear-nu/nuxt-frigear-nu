import { useValidatedBody } from 'h3-zod'
import { db, schema } from '@nuxthub/db'
import type { Users } from '@nuxthub/db/schema'
import WelcomeToFrigearEmail from '#shared/emails/auth/WelcomeToFrigearEmail.vue'
import { signUpWithMagicLinkSchema } from '#shared/schema/auth'
import { ClientError, ServerError } from '@nitrotool/errors'

export default defineEventHandler(async (event) => {
  const {
    mail: { from, to: replyTo },
    auth: { signUp, verifyEmail },
  } = useRuntimeConfig(event)
  const { user } = await getUserSession(event)

  if (user) {
    return sendRedirect(event, await getDefaultRedirectForUser(event, user as Users))
  }

  const { name, email, redirect } = await useValidatedBody(event, signUpWithMagicLinkSchema)

  const existingUser = await findUserByEmail(email)

  if (existingUser || !signUp) throw ClientError('errors.auth.signUp.failed')

  const [createdUser] = await db
    .insert(schema.users)
    .values({
      name,
      email,
      // verifiedAt will be set when the user signs in.
    })
    .returning()

  if (!createdUser) throw ServerError('errors.auth.signUp.failedCreate')

  const { url: signUpUrl } = await createMagicLinkForUser({
    userId: createdUser.id,
    redirectUrl: redirect && isInternalUrl(redirect) ? redirect : undefined,
  })

  if (import.meta.dev) {
    console.log(`Verify email with this URL: ${signUpUrl}`)
    return {
      message: 'Success',
      local: true,
    }
  }

  await sendEmailTemplate(event, {
    from,
    replyTo,
    to: email,
    subject: 'Welcome to Frigear!',
    component: WelcomeToFrigearEmail,
    props: {
      magicLinkUrl: signUpUrl,
      requireEmailVerification: verifyEmail,
      gdprUrl: withSiteUrl(event, '/legal/gdpr'),
    },
  })

  return {
    message: 'Success',
    local: false,
  }
})
