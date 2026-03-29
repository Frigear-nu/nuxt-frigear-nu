import { authorize } from 'nuxt-authorization/utils'
import { canReadUser } from '#shared/abilities/admin/users'
import { db } from '@nuxthub/db'
import { users } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  await authorize(canReadUser, user)

  const id = getRouterParam(event, 'id')
  const userId = Number(id)

  if (!userId || Number.isNaN(userId)) {
    throw createError({ statusCode: 400, message: 'Invalid user ID' })
  }

  const result = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      passwordHash: false,
    },
  })

  if (!result) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  return result
})
