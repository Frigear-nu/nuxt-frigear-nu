<script setup lang="ts">
import type { PageCardProps } from '@nuxt/ui'
import { useSiteI18n } from '#imports'

const { t, localePath } = useSiteI18n()

const cards = computed<PageCardProps[]>(() => ([
  {
    title: t('account.membership.title'),
    description: t('account.membership.description'),
    icon: 'i-lucide-credit-card',
    to: localePath('/account/membership'),
    variant: 'subtle',
  },
  {
    title: t('account.settings.title'),
    description: t('account.settings.description'),
    icon: 'i-lucide-user-round-pen',
    to: localePath('/account/settings'),
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
  </upagegrid>
</template>
