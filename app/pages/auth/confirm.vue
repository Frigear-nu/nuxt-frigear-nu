<script setup lang="ts">
// FIXME: After sb migration this file can be deleted.
const { currentUser, refresh } = useAuth()

watchEffect(async () => {
  if (currentUser.value) {
    return navigateTo('/account')
  }

  await refresh()

  if (currentUser.value) {
    return navigateTo('/account')
  }
})
</script>

<template>
  <UContainer>
    <UPageHeader :ui="{ title: 'flex flex-row' }">
      <template #title>
        <UIcon
          name="i-lucide-refresh-ccw"
          class="animate-spin mr-4"
        />
        <div>Waiting for login...</div>
      </template>
    </UPageHeader>
  </UContainer>
</template>
