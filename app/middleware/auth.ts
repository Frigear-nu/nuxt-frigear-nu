import { useUserSession } from '#imports'

export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith('/account')) {
    return
  }
  const { loggedIn } = useUserSession()

  if (loggedIn.value) return
  return navigateTo(`/sign-in?redirect=${encodeURIComponent(to.fullPath)}`, { replace: true })
})
