<script lang="ts" setup>
definePageMeta({
  header: false,
})

// todo: check if ssr MUST be disabled or if we need this check every time.

const user = useSupabaseUser()
const redirectInfo = useSupabaseCookieRedirect()
// const route = useRoute()

// const mode = computed<'in' | 'up'>(() => {
//   return route.fullPath.includes('mode=up') ? 'up' : 'in'
// })

watch(user, () => {
  if (user.value) {
    // Get redirect path, and clear it from the cookie
    const path = redirectInfo.pluck()
    // Redirect to the saved path, or fallback to home
    return navigateTo(path || '/account')
  }
}, { immediate: true })
</script>

<template>
  <UContainer class="h-[calc(100vh-var(--ui-header-height))] flex items-center justify-center px-4 flex-col gap-4">
    <NuxtLink
      class="flex justify-center"
      to="/"
    >
      <UColorModeImage
        light="/logo.png"
        dark="/logo-dark.png"
        class="size-24"
      />
    </NuxtLink>

    <NuxtPage />
  </UContainer>
</template>
