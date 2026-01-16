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

    if (!dbUser) {
      [dbUser] = await db.insert(schema.users)
      // todo: get full_name from google?
        .values({ email, name: email })
        .returning()
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
