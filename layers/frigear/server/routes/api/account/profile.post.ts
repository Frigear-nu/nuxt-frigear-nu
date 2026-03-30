import { useValidatedBody } from 'h3-zod'
import { updateUserProfileSchema } from '#shared/schema/user'
import { eq } from 'drizzle-orm'
import { ServerError } from '@nitrotool/errors'
import { requireUserId } from '#server/utils/auth'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const { name } = await useValidatedBody(event, updateUserProfileSchema)

  const [updatedUser] = await db
    .update(schema.users)
    .set({ name })
    .where(eq(schema.users.id, userId))
    .returning()

  if (!updatedUser) throw ServerError('errors.auth.updateProfile.failed')

  return authenticateUser(event, updatedUser)
})
