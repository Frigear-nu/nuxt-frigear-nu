<script lang="ts" setup>
import { computedAsync } from '@vueuse/core'

const { currentUserRole } = useAuth()

const allowedBARoles = [
  'admin',
  'manager',
  'coordinator',
  'eventmanager',
  'barmanager',
  'crew',
]

const documents = computedAsync(async () => {
  const items = [

    {
      path: '/assets/files/Frivillig håndbog.docx',
      name: 'Frivillig Håndbog',
      nameEn: 'Volunteer Handbook',
      icon: 'i-lucide-file',
    },
  ]

  if (currentUserRole.value && allowedBARoles.includes(currentUserRole.value)) {
    items.unshift({
      path: '/assets/files/BA-Koordinatormøde-2503-2026.docx',
      name: 'BA Koordinatormøde 25.03.2026',
      nameEn: 'BA Coordinatormeeting 25.03.2026',
      icon: 'i-lucide-file',
    })
  }

  return items
})
</script>

<template>
  <UPageGrid>
    <UPageCard
      v-for="document in documents"
      :key="document.path"
      :title="document.name"
      :icon="document.icon"
    >
      <UButton
        download
        external
        :to="document.path"
        icon="i-lucide-download"
      >
        {{ $t('account.documents.download') }}
      </UButton>
    </UPageCard>
  </UPageGrid>
</template>
