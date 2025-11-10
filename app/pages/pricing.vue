<template>
  <UEmpty
      icon="i-lucide-info"
      title="Custom page"
      :actions="[
      {
        icon: 'i-lucide-home',
        label: 'Back home',
        color: 'neutral',
        variant: 'subtle',
        to: '/'
      }
    ]"
  >
    <template #description>
      This page can be edited in <code>app/pages/pricing.vue</code>.
    </template>
  </UEmpty>
</template>
