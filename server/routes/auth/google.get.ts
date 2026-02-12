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

    if (import.meta.dev) console.log({ googleUser: user, dbUser })
    if (!dbUser) {
      [dbUser] = await db
        .insert(schema.users)
        // todo: get full_name/avatar from google?
        .values({
          email,
          name: user?.full_name || email, // ??
          avatarUrl: user?.picture || user?.avatar_url,
          emailVerifiedAt: new Date(),
        })
        .returning()
    }

    if (!dbUser) throw ServerError('Could find user.')

    return authenticateUser(event, dbUser, await getDefaultRedirectForUser(event, dbUser))
  },
})
