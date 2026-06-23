import { useUserSession } from '#imports'

export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn } = useUserSession()

  // TODO: We might want to configure the paths that require auth in nuxt.config.ts in the future
  if (loggedIn.value) {
    return
  }

  //
  return navigateTo({
    path: '/sign-in',
    query: { redirect: to.path },
  }, { replace: true })
})
