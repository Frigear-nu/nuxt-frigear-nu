import { authorize } from 'nuxt-authorization/utils'
import { canManageUsers } from '#shared/abilities/admin'
import { db, schema } from '@nuxthub/db'
import { z } from 'zod/v4'
import { adminCreateUserSchema } from '#shared/schema/admin/user'
import { eq } from 'drizzle-orm'

const routeSchema = z.object({
  id: z.coerce.number(),
})

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  await authorize(canManageUsers, user)

  const { id: userId } = await getValidatedRouterParams(event, routeSchema.parse)
  const { name, email, role, phone, roskildePeopleId } = await readValidatedBody(event, adminCreateUserSchema.parse)

  const existingUser = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.id, userId),
  })

  if (!existingUser) {
    throw createError({
      status: 404,
      message: 'User not found.',
    })
  }

  // do the update...
  const [updatedUser] = await db.update(schema.users)
    .set({
      name,
      email,
      role,
      phone,
      roskildePeopleId,
    })
    .where(eq(schema.users.id, userId))
    .returning()

  if (!updatedUser) {
    throw createError({
      status: 500,
      message: 'Failed to update user.',
    })
  }

  return updatedUser
})
