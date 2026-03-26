<script setup lang="ts">
import type { PageCardProps } from '@nuxt/ui'
import { useSiteI18n } from '#imports'
import { allows } from 'nuxt-authorization/utils'
import { canViewForms } from '#shared/abilities/forms'
import { computedAsync } from '@vueuse/core'
import { upperFirst } from 'scule'

const { t, localePath } = useSiteI18n()
const { currentUser } = useAuth()

const pageHeaderDescription = computed(() => {
  if (!currentUser.value) return undefined
  return `Role: ${upperFirst(currentUser.value.role)}`
})

const cards = computedAsync<PageCardProps[]>(async () => {
  const items: PageCardProps[] = [
    {
      title: 'Events',
      description: 'See all events, and their participants etc.',
      icon: 'i-lucide-calendars',
      to: localePath('/admin/events'),
      variant: 'subtle',
    },
  ]

  if (currentUser.value && await allows(canViewForms, currentUser.value)) {
    items.push({
      title: 'Forms',
      description: 'See all forms available, and their submissions.',
      icon: 'i-lucide-form',
      to: localePath('/admin/forms'),
      variant: 'subtle',
    })
  }

  return items
})
</script>

<template>
  <div>
    <UContainer>
      <UPageHeader
        title="Admin Area"
        :description="pageHeaderDescription"
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
