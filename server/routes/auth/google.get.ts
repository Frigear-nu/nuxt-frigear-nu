import { ServerError } from '@nitrotool/errors'

export default defineOAuthGoogleEventHandler({
  config: {
    authorizationParams: {
      access_type: 'offline',
    },
  },
  async onSuccess(event, { user }) {
    // TODO: Check if signed in with google before - and matching email.
    //  - if not create user and provider details.
    const email: string = user.email || ''
    let dbUser = await findUserByEmail(email)

    if (import.meta.dev) console.log({ user })
    if (!dbUser) {
      [dbUser] = await db.insert(schema.users)
      // todo: get full_name/avatar from google?
        .values({ email, name: user?.full_name || email, emailVerifiedAt: new Date() })
        .returning()
    }

    // todo: check if this might be triggered.
    if (!dbUser) throw ServerError()

    // todo: centralize redirect storage.
    return authenticateUser(event, dbUser, await getDefaultRedirectForUser(event, dbUser))
  },
})
