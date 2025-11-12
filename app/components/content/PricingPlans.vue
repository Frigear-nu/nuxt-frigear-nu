<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import { withoutLeadingSlash } from 'ufo'

const props = defineProps<{
  subscriptions: TabsItem[] | never[] | string
  mode: 'list' | 'tabs'
}>()

const items = computed(() => {
  if (!props.subscriptions || typeof props.subscriptions === 'string') return []

  if (props.mode === 'list') {
    return props.subscriptions
  }

  return props.subscriptions.map(sub => ({
    value: sub.id,
    label: withoutLeadingSlash(sub.billingCycle),
    ...sub,
  }))
})
</script>

<template>
  <UEmpty
    v-if="!subscriptions || subscriptions.length === 0"
    icon="i-lucide-info"
    title="Custom page"
    :actions="[
      {
        icon: 'i-lucide-home',
        label: 'Back home',
        color: 'neutral',
        variant: 'subtle',
        to: '/',
      },
    ]"
  >
    <template #description>
      This page can be edited in <code>app/pages/pricing.vue</code>.
    </template>
  </UEmpty>
  <UPricingPlans v-if="mode === 'list'">
    <UPricingPlan
      v-for="(plan, index) in items"
      :key="index"
      v-bind="plan"
    />
  </UPricingPlans>
  <UTabs
    v-if="mode === 'tabs'"
    :items="items"
    default-value="annual"
  >
    <template
      #content="{ item }"
    >
      <UPricingPlan
        v-bind="item"
      />
    </template>
  </UTabs>
</template>
