import { ServerError } from '@nitrotool/errors'

export default defineOAuthGoogleEventHandler({
  config: {
    authorizationParams: {
      access_type: 'offline',
    },
  },
  async onSuccess(event, { user }) {
    const email: string = user.email || ''
    let dbUser = await findUserByEmail(email)

    if (!dbUser) {
      [dbUser] = await db
        .insert(schema.users)
        .values({
          email,
          name: user?.name || email,
          avatarUrl: user?.picture,
          // user.email_verified could be false - TBA
          emailVerifiedAt: new Date(),
        })
        .returning()
    }

    if (!dbUser) throw ServerError('Could find user.')

    return authenticateUser(event, dbUser, await getDefaultRedirectForUser(event, dbUser))
  },
})
