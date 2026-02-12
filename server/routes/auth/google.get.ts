import { ServerError } from '@nitrotool/errors'
import { db, schema } from '@nuxthub/db'

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

    // // FIXME: Should probably not let this be rewritten now that google will allow recycling accounts?
    // // Create or update the oauth relationship:
    // await db.insert(schema.oauthApps)
    //   .values({
    //     userId: dbUser.id,
    //     provider: 'google',
    //     providerAccountId: user.sub,
    //   })
    //   .onConflictDoUpdate({
    //     target: [schema.oauthApps.userId, schema.oauthApps.provider],
    //     set: { providerAccountId: user.sub },
    //   })

    return authenticateUser(event, dbUser, await getDefaultRedirectForUser(event, dbUser))
  },
})
