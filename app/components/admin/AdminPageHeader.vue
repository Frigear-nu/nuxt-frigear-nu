<script lang="ts" setup>
import type { ButtonProps, PageHeaderProps } from '@nuxt/ui'
import { objectOmit } from '@vueuse/core'

const { localePath } = useSiteI18n()
type Props = PageHeaderProps & {
  returnButton?: ButtonProps | false | undefined
}
const props = withDefaults(defineProps<Props>(), {
  returnButton: undefined,
})

const usedReturnButton = computed<ButtonProps | false>(() => props.returnButton === false
  ? false
  : props.returnButton ?? ({
    label: 'Admin',
    to: localePath('/admin'),
    icon: 'i-lucide-arrow-left',
    variant: 'link',
  }))
</script>

<template>
  <UPageHeader
    v-bind="objectOmit($props, ['returnButton'])"
    :ui="{ headline: 'flex-1 p-0' }"
  >
    <template
      v-if="usedReturnButton !== false && usedReturnButton !== undefined"
      #headline
    >
      <UButton
        class="p-0"
        v-bind="usedReturnButton"
      />
    </template>
  </UPageHeader>
</template>
