<script lang="ts" setup>
definePageMeta({
  header: false,
})
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

    <AuthForm />

    <UButton
      icon="i-lucide-x"
      variant="soft"
      to="/"
    >
      Avbryt
    </UButton>
  </UContainer>
</template>
