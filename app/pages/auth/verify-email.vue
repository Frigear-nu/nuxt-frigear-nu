<script setup lang="ts">
</script>

<template>
  <UContainer class="h-[calc(100vh-var(--ui-header-height))] flex items-center justify-center px-4 flex-col gap-4">
    <UEmpty
      :ui="{ title: 'flex flex-row items-center' }"
      :title="$t('auth.verifyEmail.title')"
      :description="$t('auth.verifyEmail.description')"
    />
  </UContainer>
</template>
