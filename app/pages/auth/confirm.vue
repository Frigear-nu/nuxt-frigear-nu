<script setup lang="ts">
import { useUserSession } from '#imports'

const { user: customUser, fetch: refreshSession } = useUserSession()
const user = useSupabaseUser()
const redirectInfo = useSupabaseCookieRedirect()

// watch(user, async () => {
//   if (user.value) {
//     // ensure we load the user from supabase into the custom user session.
//     await $fetch('/api/auth/me')
//     // todo: remove supabase
//     await refreshSession()
//     if (!customUser.value) {
//       console.warn('Custom user not found when loading as signed in via supabase.')
//     }
//     // Get redirect path, and clear it from the cookie
//     const path = redirectInfo.pluck()
//     // Redirect to the saved path, or fallback to home
//     return navigateTo(path || '/account')
//   }
// }, { immediate: true })

onMounted(async () => {
  if (customUser.value) {
    return navigateTo('/account')
  }

  await refreshSession()

  if (customUser.value) {
    return navigateTo('/account')
  }
})
</script>

<template>
  <div>Waiting for login...</div>
  <pre>
    {{ customUser }}
  </pre>
</template>
