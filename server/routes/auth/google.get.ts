import { serverSupabaseServiceRole } from '#supabase/server'
import { eq } from 'drizzle-orm'
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

    if (!dbUser) {
      [dbUser] = await db.insert(schema.users)
      // todo: get full_name from google?
        .values({ email, name: email })
        .returning()
    }

    if (!dbUser.isMigrated) {
      const serviceRole = serverSupabaseServiceRole(event)
      const sbUser = await findSupabaseUserByEmail(serviceRole, email)

      if (sbUser) {
        await migrateSupabaseAccountById(serviceRole, dbUser.id, sbUser.id)
        await db.update(schema.users).set({ isMigrated: true }).where(eq(schema.users.id, dbUser.id))
        dbUser = await findUserByEmail(email)
      }
    }

    // todo: check if this might be triggered.
    if (!dbUser) throw ServerError()

    // todo: centralize redirect storage.
    return authenticateUser(event, dbUser, '/')
  },
})
