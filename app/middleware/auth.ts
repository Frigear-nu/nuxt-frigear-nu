import { useUserSession } from '#imports'
import { allows } from 'nuxt-authorization/utils'
import { canViewAdminArea } from '#shared/abilities/admin'

export default defineNuxtRouteMiddleware(async (to) => {
  const isAccountRoute = to.path.startsWith('/account')
  const isAdminRoute = to.meta.groups?.includes('admin') ?? false

  // not relevant:
  if (!isAccountRoute && !isAdminRoute) return

  const { user, loggedIn } = useUserSession()

  // TODO: We might want to configure the paths that require auth in nuxt.config.ts in the future
  if (isAccountRoute && loggedIn.value) {
    return
  }

  if (isAdminRoute) {
    // TODO: Phase out static admin flags
    const admins = useRuntimeConfig()?.acl?.admins?.split(',') ?? []
    const isAdmin = loggedIn.value && !!user.value?.email && admins.includes(user.value.email)
    const isAllowedToView = await allows(canViewAdminArea, user.value)
    if (isAdmin || isAllowedToView) {
      return
    }
  }
  return navigateTo({
    path: '/sign-in',
    query: { redirect: to.path },
  }, { replace: true })
})
