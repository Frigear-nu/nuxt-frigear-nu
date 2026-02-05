<script setup lang="ts">
</script>

<template>
  <div class="max-w-md mx-auto mt-[calc(50vh-200px)]">
    <UEmpty
      icon="i-lucide-check"
      title="Success!"
      :actions="[{ label: 'Go to account', to: '/account/membership', trailingIcon: 'i-lucide-arrow-right' }]"
      :ui="{
        avatar: 'bg-success/20',
      }"
    />
  </div>
</template>
