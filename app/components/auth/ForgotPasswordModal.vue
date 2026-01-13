<script lang="ts" setup>
const displayModal = defineModel<boolean>('open', { default: false })
</script>

<template>
  <UModal
    v-model:open="displayModal"
    title="Forgot password?"
  >
    <template #body>
      So... you forgot your password, again...?
    </template>
    <template #footer>
      TODO...
    </template>
  </UModal>
</template>
