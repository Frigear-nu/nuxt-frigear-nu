import { ServerError } from '@nitrotool/errors'
import { eq } from 'drizzle-orm'

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
          lastLoginAt: new Date(),
        })
        .returning()
    }
    else {
      [dbUser] = await db
        .update(schema.users)
        .set({ lastLoginAt: new Date() })
        .where(eq(schema.users.id, dbUser.id))
        .returning()
    }

    if (!dbUser) throw ServerError('Could find user.')

    return authenticateUser(event, dbUser, await getDefaultRedirectForUser(event, dbUser))
  },
})
