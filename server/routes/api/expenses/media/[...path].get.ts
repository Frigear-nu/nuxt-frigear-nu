import { blob } from '@nuxthub/blob'
import { NotFoundError, UnauthorizedError } from '@nitrotool/errors'
import { canViewAllExpenses } from '#shared/abilities/expenses'
import { allows } from 'nuxt-authorization/utils'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const mediaPath = getRouterParam(event, 'path')

  if (!mediaPath) {
    throw NotFoundError()
  }

  // Admins can access any expense attachment; regular users may only access their own
  const isAdmin = await allows(canViewAllExpenses, user)
  if (!isAdmin && !mediaPath.includes(`user_${user.id}/`)) {
    throw UnauthorizedError()
  }

  return blob.serve(event, mediaPath)
})
