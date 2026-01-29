<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import type { ContactFormSchema } from '#shared/schema/forms/contact'

withDefaults(defineProps<{
  button?: ButtonProps
  title?: string
  initial?: ContactFormSchema
}>(), {
  button: undefined,
  title: undefined,
})

const isOpen = defineModel('open', { default: false })
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="$t(title)"
  >
    <slot v-bind="{ button, isOpen }">
      <UButton v-bind="button">
        <slot name="label" />
      </UButton>
    </slot>
    <template #body>
      <SiteContactForm
        :initial="initial"
        mode="slim"
        @success="isOpen = false"
      />
    </template>
  </UModal>
</template>
