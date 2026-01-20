<script setup lang="ts">
import type { PageCardProps } from '@nuxt/ui'
import { useSiteI18n } from '#imports'

const { t, localePath } = useSiteI18n()

const cards = computed<PageCardProps[]>(() => ([
  {
    title: t('account.settings.title'),
    description: t('account.settings.description'),
    icon: 'i-lucide-cog',
    to: localePath('/account/settings'),
  },
  {
    title: t('account.membership.title'),
    description: t('account.membership.description'),
    icon: 'i-lucide-credit-card',
    to: localePath('/account/membership'),
  },
]))
</script>

<template>
  <div class="flex flex-col gap-4">
    <UPageCard
      v-for="card in cards"
      :key="card.title"
      v-bind="card"
      orientation="horizontal"
    >
      <template #default>
        <div class="flex items-center justify-between">
          <div />
          <UButton
            :to="card.to"
            size="xl"
            trailing-icon="i-lucide-arrow-right"
          >
            {{ t('actions.view') }}
          </UButton>
        </div>
      </template>
    </UPageCard>
  </div>
</template>
