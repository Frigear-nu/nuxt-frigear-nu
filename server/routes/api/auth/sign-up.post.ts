import { db, schema } from '@nuxthub/db'
import { withQuery } from 'ufo'
import { addHours } from 'date-fns'
import { signUpWithPasswordSchema } from '#shared/schema/auth'
import { useValidatedBody } from 'h3-zod'
import { ClientError, ServerError } from '@nitrotool/errors'
import type { Users } from '@nuxthub/db/schema'
import WelcomeToFrigearEmail from '#shared/emails/auth/WelcomeToFrigearEmail.vue'

export default defineEventHandler(async (event) => {
  const {
    mail: { from, to: replyTo },
    auth: { signUp, verifyEmail },
  } = useRuntimeConfig(event)
  const { user } = await getUserSession(event)

  if (user) {
    return sendRedirect(event, await getDefaultRedirectForUser(event, user as Users))
  }

  if (!signUp) throw createError({ statusCode: 400, message: 'Signup is disabled.' })

  const { name, email, password } = await useValidatedBody(event, signUpWithPasswordSchema)

  const existingUser = await findUserByEmail(email)

  if (existingUser) throw ClientError('errors.auth.signUp.failed')

  const [createdUser] = await db
    .insert(schema.users)
    .values({
      name,
      email,
      passwordHash: await hashPassword(password),
      emailVerifiedAt: verifyEmail ? null : new Date(),
    })
    .returning()

  if (!createdUser) throw ServerError('errors.auth.signUp.failedCreate')

  let verifyUrl: string | undefined

  if (verifyEmail) {
    // This will mark the email address as verified if it was not from before.
    const token = createSafeId()
    const expiresAt = addHours(new Date(), 12)
    const [createdMagicLink] = await db
      .insert(schema.magicLinks)
      .values({
        token,
        expiresAt: expiresAt,
        userId: createdUser.id,
      })
      .returning()

    if (!createdMagicLink) throw ClientError('Could not create magic link.')

    verifyUrl = withBaseUrl(withQuery('/auth/magic-link', { token }))
  }

  if (import.meta.dev) {
    console.log(`Verify email with this URL: ${verifyUrl}`)
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
      verifyUrl,
      requireEmailVerification: verifyEmail,
    },
  })

  return mapUserToSession(createdUser)
})
