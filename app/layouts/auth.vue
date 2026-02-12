<script lang="ts" setup>
definePageMeta({
  header: false,
})

const { user } = useUserSession()

watch(user, () => {
  if (user.value) {
    // FIXME: Use proper redirect here.
    return navigateTo('/account')
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
