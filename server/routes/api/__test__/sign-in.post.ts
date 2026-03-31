import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import { mapUserToSession } from '#server/utils/auth'

const TEST_EMAIL = 'test-expenses@frigear.nu'
const TEST_PASSWORD = 'Test1234!'

/**
 * Test-only endpoint: creates (or reuses) a test user and sets a session cookie.
 * Only available when `testMode` is enabled in runtimeConfig (i.e. the $test env).
 */
export default defineEventHandler(async (event) => {
  const { testMode } = useRuntimeConfig(event)
  if (!testMode) throw createError({ statusCode: 404 })

  let user = await db.query.users.findFirst({
    where: () => eq(schema.users.email, TEST_EMAIL),
  })

  if (!user) {
    const [created] = await db.insert(schema.users).values({
      name: 'Test User',
      email: TEST_EMAIL,
      passwordHash: await hashPassword(TEST_PASSWORD),
      emailVerifiedAt: new Date(),
    }).returning()
    if (!created) throw createError({ statusCode: 500, message: 'Failed to create test user' })
    user = created
  }

  await setUserSession(event, {
    user: await mapUserToSession(user),
    loggedInAt: Date.now(),
  })

  return { ok: true }
})
