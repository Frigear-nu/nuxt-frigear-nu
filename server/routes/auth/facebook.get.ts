import { createOrFindUser } from '#server/utils/user'

export default defineOAuthFacebookEventHandler({
  config: {
    scope: ['email'],
    fields: ['id', 'email', 'name'],
  },
  async onSuccess(event, { user }) {
    if (typeof user === 'string') {
      user = JSON.parse(user)
    }

    if (!user.email) {
      throw createError({
        status: 400,
        message: 'Missing email',
      })
    }

    const frigearUser = await createOrFindUser(user.email, {
      role: 'user',
      name: user.name,
      emailVerifiedAt: new Date(),
      lastLoginAt: new Date(),
    })

    await ensureStripeCustomer(frigearUser)

    return authenticateUser(event, frigearUser, await getDefaultRedirectForUser(event, frigearUser))
  },
})
