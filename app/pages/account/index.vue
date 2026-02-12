<script setup lang="ts">
import type { ButtonProps, PageCardProps } from '@nuxt/ui'
import { useSiteI18n } from '#imports'
import { useUserMemberships } from '~/store/queries/user'

const { t, localePath } = useSiteI18n()
const { data: userMemberships } = useUserMemberships()
const { data: cartItems, hasAnyItems: hasAnyCartItems } = useShoppingCart()

// Membership
const membershipActions = ref<ButtonProps[]>([
  {
    label: 'Continue setup',
    trailingIcon: 'i-lucide-arrow-right',
    color: 'neutral',
    onClick() {
      navigateTo('/account/membership')
    },
  },
])

const cards = computed<PageCardProps[]>(() => ([
  {
    title: t('account.membership.title'),
    description: t('account.membership.description'),
    icon: 'i-lucide-credit-card',
    to: localePath('/account/membership'),
    variant: 'subtle',
  },
  {
    title: t('account.profile.title'),
    description: t('account.profile.description'),
    icon: 'i-lucide-user-round-pen',
    to: localePath('/account/profile'),
    variant: 'subtle',
  },
  {
    title: t('account.security.title'),
    description: t('account.security.description'),
    icon: 'i-lucide-shield-user',
    to: localePath('/account/security'),
    variant: 'subtle',
  },
]))
</script>

<template>
  <div>
    <div v-if="hasAnyCartItems && userMemberships && userMemberships.length === 0">
      <UAlert
        title="Almost there!"
        :description="cartItems[0] ? `Please sign up to continue to payment of ${cartItems[0].title}` : 'Missing details'"
        icon="i-lucide-info"
        class="my-8"
        :actions="membershipActions"
        :close="{
          class: 'text-white dark:text-black',
        }"
        :ui="{
          title: 'font-bold',
        }"
      />
    </div>

    <UPageGrid class="lg:grid-cols-2">
      <UPageCard
        v-for="card in cards"
        :key="card.title"
        v-bind="card"
        orientation="horizontal"
      >
        <template #default>
          <div class="flex justify-between items-center gap-4">
            <div class="hidden lg:block" />
            <UButton
              :to="card.to"
              size="xl"
              trailing-icon="i-lucide-arrow-right"
              class="justify-between gap-4 lg:w-auto hidden lg:flex"
              variant="outline"
              color="neutral"
            >
              {{ t('actions.view') }}
            </UButton>
          </div>
        </template>
      </UPageCard>
    </UPageGrid>
  </div>
</template>
