import { createOrFindUser } from '#server/utils/user'

export default defineOAuthFacebookEventHandler({
  config: {
    scope: ['email'],
    fields: ['id', 'email', 'name'],
  },
  async onSuccess(event, { user }) {
    if (typeof user === 'string') {
      console.log('FB Auth User', typeof user)
      user = JSON.parse(user)
    }

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
