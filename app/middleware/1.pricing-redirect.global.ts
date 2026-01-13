export default defineNuxtRouteMiddleware((to) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  import.meta.dev && console.log(to.fullPath)

  // todo: uncomment block if you want to enable the redirect from /pricing to /account if signed in.
  // if (to.fullPath !== '/pricing') {
  //   return
  // }
  //
  // const user = useSupabaseUser()
  //
  // if (!user.value) {
  //   return
  // }
  //
  // // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  // import.meta.dev && console.log('Redirecting to account page.')
  //
  // return navigateTo('/account')
})
