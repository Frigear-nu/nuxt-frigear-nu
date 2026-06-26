<script lang="ts" setup>
const { locale } = useSiteI18n()
const documents = [
  { path: '/assets/files/BA-Koordinatormøde-2503-2026.docx', name: 'BA Koordinatormøde 25.03.2026', nameEn: 'BA Coordinatormeeting 25.03.2026', icon: 'i-lucide-file' },
  { path: '/assets/files/Frivillig håndbog.docx', name: 'Frivillig Håndbog', nameEn: 'Volunteer Handbook', icon: 'i-lucide-file' },
]
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
        {{ locale === 'en' ? 'Download' : 'Hent fil' }}
      </UButton>
    </UPageCard>
  </UPageGrid>
</template>
