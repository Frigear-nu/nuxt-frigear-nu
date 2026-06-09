<script lang="ts" setup>
import type { ButtonProps } from '@nuxt/ui'

const overlay = useOverlay()
const { data: websites } = useFetch('/api/admin/websites')

const headerActions = computed<ButtonProps[]>(() => [
  { label: 'Manage Clients', to: '/admin/oauth/clients', icon: 'i-lucide-plus' },
])
</script>

<template>
  <UContainer>
    <UPageHeader
      title="OAuth"
      description="Websites & OAuth Clients"
      :links="headerActions"
    />
    <UPageBody>
      <UPageGrid v-if="websites && websites.length > 0">
        <UPageCard
          v-for="website in websites"
          :key="website.websiteUrl"
          :title="website.name"
        />
      </UPageGrid>
      <UEmpty
        v-else
        :actions="headerActions"
      >
        <template #title>
          No websites found
        </template>
      </UEmpty>
    </UPageBody>
  </UContainer>
</template>
