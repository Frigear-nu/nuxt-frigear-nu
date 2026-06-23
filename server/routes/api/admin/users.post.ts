import { authorize } from 'nuxt-authorization/utils'
import { canManageUsers } from '#shared/abilities/admin'
import { db, schema } from '@nuxthub/db'
import WelcomeToFrigearEmail from '#shared/emails/auth/WelcomeToFrigearEmail.vue'
import { adminCreateUserSchema } from '#shared/schema/admin/user'
import { userRoleIsHigher } from '#shared/acl'

export default defineEventHandler(async (event) => {
  const {
    mail: { from, to: replyTo },
    auth: { verifyEmail },
  } = useRuntimeConfig(event)
  const { user } = await requireUserSession(event)
  await authorize(canManageUsers, user)

  const { name, email, role, phone, roskildePeopleId, sendWelcomeEmail, emailVerified } = await readValidatedBody(event, adminCreateUserSchema.parse)

  const existingUser = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.email, email),
  })

  if (existingUser) {
    throw createError({
      status: 409,
      message: 'User already exists.',
    })
  }

  // ensure user cannot create higher than themselves:
  if (!userRoleIsHigher(user.role, role)) {
    throw createError({
      status: 403,
      message: 'You cannot assign a role higher than your own.',
    })
  }

  const [createdUser] = await db.insert(schema.users)
    .values({
      name,
      email,
      role,
      phone,
      roskildePeopleId,
      emailVerifiedAt: emailVerified ? new Date() : null,
    }).returning()

  if (!createdUser) {
    throw createError({
      status: 500,
      message: 'Failed to create user.',
    })
  }

  if (verifyEmail && sendWelcomeEmail) {
    // This will mark the email address as verified if it was not from before.
    const { url } = await createMagicLinkForUser({
      userId: createdUser.id,
      redirectUrl: '/account',
    })

    if (import.meta.dev) {
      console.log(`Verify email with this URL: ${url}`)
    }

    await sendEmailTemplate(event, {
      from,
      replyTo,
      to: email,
      subject: 'Welcome to Frigear!',
      component: WelcomeToFrigearEmail,
      props: {
        verifyUrl: url,
        requireEmailVerification: verifyEmail,
      },
    })
  }

  return createdUser
})
