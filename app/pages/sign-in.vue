<script lang="ts" setup>
import { useUrlSearchParams } from '@vueuse/core'

definePageMeta({
  header: false,
  layout: 'auth',
})

const params = useUrlSearchParams<{
  mode?: 'up' | 'in'
}>('history')

const mode = computed<'up' | 'in'>({
  get: () => {
    if (!params.mode) return 'in'
    return params.mode === 'up' ? 'up' : 'in'
  },
  set: (v) => {
    if (v === 'in') params.mode = undefined
    else params.mode = v
  },
})
</script>

<template>
  <AuthCard v-model:mode="mode" />
</template>
