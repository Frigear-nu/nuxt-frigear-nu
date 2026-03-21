<script setup lang="ts">
const [{ data: events }] = await Promise.all([
  useAsyncData('admin:events', () => queryCollection('events').all(), { default: () => [] }),
])

const { translatedProperty } = useContent()
</script>

<template>
  <div>
    <UContainer class="flex flex-col gap-8">
      <UPageHeader
        title="Events"
        :links="[{ label: 'Admin', to: $localePath('/admin'), icon: 'i-lucide-home' }]"
      />
      <UPageGrid v-if="events && events.length">
        <UPageCard
          v-for="event in events"
          :key="event.id"
          :title="translatedProperty(event.name)"
          :description="event.title && $t(event.title)"
          :to="`/admin/events${event.path}`"
        />
      </UPageGrid>
      <UEmpty
        v-else
        title="No events yet!"
        description="You can create events from the website studio"
        :actions="[{ label: 'Go to website studio', to: '/_studio', trailingIcon: 'i-lucide-arrow-right' }]"
      />
    </UContainer>
  </div>
</template>
