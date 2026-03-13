import { useUserSession } from '#imports'

export default defineNuxtRouteMiddleware((to) => {
  const isAccountRoute = to.path.startsWith('/account')
  const isAdminGroup = to.meta.groups?.includes('admin') ?? true

  if (!isAccountRoute || !isAdminGroup) return

  const { loggedIn } = useUserSession()

  if (isAdminGroup) {
    // todo: check admin rights..
  }
  if (loggedIn.value) return
  return navigateTo(`/sign-in?redirect=${encodeURIComponent(to.fullPath)}`, { replace: true })
})
