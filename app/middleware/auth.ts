import { useUserSession } from '#imports'

export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()

  if (loggedIn.value) return
  return navigateTo('/sign-in?redirect=' + to.fullPath, { replace: true })
})
