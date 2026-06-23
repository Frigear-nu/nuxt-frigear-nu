import { useUserSession } from '#imports'
import { allows } from 'nuxt-authorization/utils'
import { canViewAdminArea } from '#shared/abilities/admin'

export default defineNuxtRouteMiddleware(async () => {
  const { user } = useUserSession()

  if (user.value && await allows(canViewAdminArea, user.value)) {
    return
  }

  const message = 'Forbidden: Insufficient Permissions'
  throw createError({ status: 403, message, statusText: message, fatal: true })
})
