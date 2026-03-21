<script setup lang="ts">
import type { PageCardProps } from '@nuxt/ui'
import { useSiteI18n } from '#imports'

const { t, localePath } = useSiteI18n()
const { currentUser } = useAuth()

const cards = computed<PageCardProps[]>(() => [
  {
    title: 'Events',
    description: 'See all events, and their participants etc.',
    icon: 'i-lucide-calendars',
    to: localePath('/admin/events'),
    variant: 'subtle',
  },
  {
    title: 'Forms',
    description: 'See all forms available, and their submissions.',
    icon: 'i-lucide-form',
    to: localePath('/admin/forms'),
    variant: 'subtle',
  },
])
</script>

<template>
  <div>
    <UContainer>
      <UPageHeader
        title="Admin"
      >
        <template #links>
          <div
            v-if="currentUser"
            class="flex flex-col"
          >
            <div class="text-sm text-muted">
              {{ $t('auth.signedInAs') }}:
            </div>
            <div class="text-primary">
              {{ currentUser.email }}
            </div>
          </div>
        </template>
      </UPageHeader>
      <UPageGrid class="lg:grid-cols-2 mt-4">
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
    </UContainer>
  </div>
</template>
