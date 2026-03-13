import { useUserSession } from '#imports'

export default defineNuxtRouteMiddleware((to) => {
  const isAccountRoute = to.path.startsWith('/account')
  const isAdminRoute = to.meta.groups?.includes('admin') ?? false

  // not relevant:
  if (!isAccountRoute && !isAdminRoute) return

  const { user, loggedIn } = useUserSession()

  // TODO: We might want to configure the paths that require auth in nuxt.config.ts in the future
  if (isAccountRoute && !loggedIn.value) {
    return navigateTo(`/sign-in?redirect=${encodeURIComponent(to.fullPath)}`, { replace: true })
  }

  // TODO: Migrate "admin" flags to db in V1 via ACL task
  if (isAdminRoute) {
    const admins = useRuntimeConfig()?.acl?.admins?.split(',') ?? []
    const isAdmin = loggedIn.value && !!user.value?.email && admins.includes(user.value.email)

    if (!isAdmin) {
      return navigateTo(`/sign-in?redirect=${encodeURIComponent(to.fullPath)}`, { replace: true })
    }
  }
})
