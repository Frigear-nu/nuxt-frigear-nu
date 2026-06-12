import { createOrFindUser } from '#server/utils/user'

export default defineOAuthFacebookEventHandler({
  config: {
    scope: ['email'],
    fields: ['id', 'email', 'name'],
  },
  async onSuccess(event, { user }) {
    user.email = String(user.email).replace('\u0040', '@').toLowerCase()

    if (!user.email) {
      console.log('FB Auth Failed', user)
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
