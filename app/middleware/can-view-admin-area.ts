import { useUserSession } from '#imports'
import { authorize } from 'nuxt-authorization/utils'
import { canViewAdminArea } from '#shared/abilities/admin'

export default defineNuxtRouteMiddleware(async () => {
  const { user } = useUserSession()

  if (user.value && await authorize(canViewAdminArea, user.value)) {
    return
  }

  throw createError({ status: 403, statusText: 'Forbidden' })
})
