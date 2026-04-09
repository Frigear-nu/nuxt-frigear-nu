import { z } from 'zod/v4'
import { authorize } from 'nuxt-authorization/utils'
import { canReadUser } from '#shared/abilities/admin/users'
import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

const routeSchema = z.object({
  id: z.coerce.number(),
})

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  await authorize(canReadUser, user)

  const { id: userId } = await getValidatedRouterParams(event, routeSchema.parse)

  const result = await db.query.users.findFirst({
    where: eq(schema.users.id, userId),
    columns: {
      passwordHash: false,
    },
  })

  if (!result) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  return result
})
