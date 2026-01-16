export default defineOAuthGoogleEventHandler({
  config: {
    authorizationParams: {
      access_type: 'offline',
    },
  },
  async onSuccess(event, { user }) {
    // build shared utils as "queries"
    const findUserByEmail = (email: string) => db.query.users.findFirst({ where: { email } })

    // TODO: Check if signed in with google before - and matching email.
    //  - if not create user and provider details.
    let dbUser = await findUserByEmail(user.email)

    if (!dbUser) {
      dbUser = await db.insert(schema.users).values({ data: { email: user.email } }).returning()
    }

    await setUserSession(event, {
      user: {
        google: user.email,
      },
      loggedInAt: Date.now(),
    })

    return sendRedirect(event, '/')
  },
})
