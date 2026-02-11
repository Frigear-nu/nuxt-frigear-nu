<script setup lang="ts">
import type { ButtonProps, PricingPlanProps, TabsItem } from '@nuxt/ui'
import { withoutLeadingSlash } from 'ufo'
import { useMemberships } from '~/store/queries/membership'
import { useSiteI18n } from '#imports'
import type { PublicPrice } from '#shared/types/membership'

const props = defineProps<{
  mode: 'list' | 'tabs'
  orientation?: 'horizontal' | 'vertical'
  button?: ButtonProps | string
}>()

const $emits = defineEmits<{
  (e: 'select', price: PublicPrice): void
}>()

const { data: availableMemberships } = useMemberships()

const { t, locale } = useSiteI18n()

const subscriptions = computed<(PricingPlanProps & { interval: string, id: string })[]>(() => {
  if (!availableMemberships.value) return []
  return availableMemberships.value.map((price) => {
    let interval = price.interval
    let billingCycle = `/ ${t(`payment.interval.${price.interval}`)}`

    if (price.interval === 'month' && price.intervalCount === 3) {
      interval = 'quarter'
      billingCycle = `/ ${t('payment.interval.quarter')}`
    }
    return {
      billingCycle,
      interval,
      id: price.id,
      title: price?.[`title_${locale.value}` as keyof typeof price] || price.title,
      description: price?.[`description_${locale.value}` as keyof typeof price] || price.description,
      price: `${price.price / 100} ${price.currency.toUpperCase()}`,
      terms: t('payment.membership.feeIncluded'),
      ui: {
        billingCycle: 'uppercase ml-1',
      },
      variant: 'outline',
      button: typeof props.button === 'string'
        ? { label: props.button }
        : props.button || {
          label: t('payment.membership.subscribe'),
          class: 'uppercase',
          // variant: 'outline',
          color: 'primary',
          onClick() {
            $emits('select', price)
          },
        },
    }
  })
})

const items = computed(() => {
  if (!subscriptions.value) return []

  if (props.mode === 'list') {
    return subscriptions.value
  }

  return subscriptions.value.map(sub => ({
    ...sub,
    value: sub.interval,
    label: withoutLeadingSlash(sub.billingCycle),
  }))
})
</script>

<template>
  <UPricingPlans
    v-if="items && items.length > 0 && mode === 'list'"
    :orientation="orientation"
  >
    <UPricingPlan
      v-for="(plan, index) in items"
      :key="index"
      v-bind="plan"
    >
      <template
        v-if="$slots.button"
        #button
      >
        <slot
          name="button"
          v-bind="{ item: plan }"
        />
      </template>
    </UPricingPlan>
  </UPricingPlans>
  <UTabs
    v-if="items && items.length > 0 && mode === 'tabs'"
    :items="items as TabsItem[]"
    default-value="year"
    :orientation="orientation"
  >
    <template
      #content="{ item }"
    >
      <UPricingPlan
        v-bind="item as PricingPlanProps"
      >
        <template
          v-if="$slots.button"
          #button
        >
          <slot
            name="button"
            v-bind="{ item }"
          />
        </template>
      </UPricingPlan>
    </template>
  </UTabs>
</template>
