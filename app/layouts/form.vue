<script lang="ts" setup>
definePageMeta({
  header: false,
})
</script>

<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="flex justify-center mb-8">
        <NuxtLink to="/">
          <UColorModeImage
            light="/logo.png"
            dark="/logo-dark.png"
            class="size-10"
          />
        </NuxtLink>
      </div>

      <NuxtPage />

      <!-- Footer slot for links like "Already have an account?" -->
      <div class="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
