<script setup lang="ts">
const { currentUser, refresh } = useAuth()
const requireVerifyEmail = Boolean(useRuntimeConfig().public?.auth?.verifyEmail)

const handleRedirect = () => {
  if (!currentUser.value) {
    return
  }

  //
  if (requireVerifyEmail && !currentUser.value?.emailVerifiedAt) {
    return navigateTo('/auth/verify-email')
  }

  return navigateTo('/account')
}

watchEffect(async () => {
  handleRedirect()
  await refresh()
  handleRedirect()
})
</script>

<template>
  <UContainer class="h-[calc(100vh-var(--ui-header-height))] flex items-center justify-center px-4 flex-col gap-4">
    <UEmpty
      :ui="{ title: 'flex flex-row items-center' }"
    >
      <template #title>
        <UIcon
          name="i-lucide-refresh-ccw"
          class="animate-spin mr-4"
        />
        <div>{{ $t('auth.confirm.title') }}</div>
      </template>
    </UEmpty>
  </UContainer>
</template>
