import { useUserSession } from '#imports'

export default defineNuxtRouteMiddleware(async (to) => {
  const { user } = useUserSession()

  // TODO: We might want to configure the paths that require auth in nuxt.config.ts in the future
  if (user.value && user.value.role === 'admin') {
    return
  }

  //
  return navigateTo({
    path: '/sign-in',
    query: { redirect: to.path },
  }, { replace: true })
})
