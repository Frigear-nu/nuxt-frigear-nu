import { createOrFindUser } from '#server/utils/user'

export default defineOAuthGoogleEventHandler({
  config: {
    authorizationParams: {
      access_type: 'offline',
    },
  },
  async onSuccess(event, { user }) {
    const email: string = user.email || ''

    const dbUser = await createOrFindUser(email, {
      name: user?.name || email,
      avatarUrl: user.picture,
      emailVerifiedAt: new Date(),
      lastLoginAt: new Date(),
    })

    await ensureStripeCustomer(dbUser)

    return authenticateUser(event, dbUser, await getDefaultRedirectForUser(event, dbUser))
  },
})
