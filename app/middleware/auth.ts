import { useUserSession } from '#imports'

export default defineNuxtRouteMiddleware((to) => {
  const isAccountRoute = to.path.startsWith('/account')
  const isAdminGroup = to.meta.groups?.includes('admin') ?? true

  if (!isAccountRoute || !isAdminGroup) return

  const { user, loggedIn } = useUserSession()

  if (!isAdminGroup && loggedIn.value) {
    return
  }

  if (isAdminGroup
    && user.value?.email
    && useRuntimeConfig()?.acl?.admins?.split(',').includes(user.value.email)) {
    return
  }
  return navigateTo(`/sign-in?redirect=${encodeURIComponent(to.fullPath)}`, { replace: true })
})
