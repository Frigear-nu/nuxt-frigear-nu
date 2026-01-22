import { useUserSession } from '#imports'

export default defineNuxtRouteMiddleware((to) => {
  console.log('auth.ts', { path: to.path })
  if (!to.path.startsWith('/account')) {
    return
  }
  const { loggedIn } = useUserSession()

  if (loggedIn.value) return
  return navigateTo(`/sign-in?redirect=${encodeURIComponent(to.fullPath)}`, { replace: true })
})
