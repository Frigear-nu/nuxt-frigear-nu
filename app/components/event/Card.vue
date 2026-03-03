<script setup lang="ts">
import type { EventsCollectionItem } from '@nuxt/content'
import { format } from 'date-fns'

const props = defineProps<{
  event: EventsCollectionItem
}>()

const { translatedProperty } = useContent()
const { getEventRequirements, getAllRequirements } = useEventTicket()

const allRequirements = computed(() => getAllRequirements(props.event))
const eventRequirements = computed(() => getEventRequirements(props.event))

// We merge all event + ticket requirements
const requirements = computed(() => {
  if (!eventRequirements.value.length && !allRequirements.value.length) {
    return []
  }

  if (!eventRequirements.value.length) {
    return allRequirements.value
  }

  return eventRequirements.value
})

const hasEventRequirement = computed(() => {
  const eventRequirements = getEventRequirements(props.event)

  return eventRequirements.length > 0
})

const hasAnyRequirements = computed(() => requirements.value.length > 0)
</script>

<template>
  <NuxtLink :to="event.path">
    <UCard>
      <div class="flex flex-col gap-2">
        <NuxtImg :src="getEventImage(event)" />
        <USeparator class="my-2" />
        <div class="flex flex-col gap-1 justify-between">
          <div class="text-lg font-semibold">
            {{ translatedProperty(event.name) }}
          </div>
          <div class="flex gap-4">
            <UBadge
              variant="soft"
              :label="format(new Date(event.start || event.date), 'dd.MM.yyyy HH:mm')"
            />
            <UBadge
              v-if="hasEventRequirement"
              variant="subtle"
              icon="i-lucide-info"
              :label="eventRequirements.map(r => translatedProperty(r?.title || r?.type || r)).join(', ')"
            />
            <UBadge
              v-else-if="hasAnyRequirements"
              variant="soft"
              icon="i-lucide-info"
              :label="requirements.map(r => translatedProperty(r?.title || r?.type || r)).join(', ')"
            />
          </div>
        </div>
        <div>
          <p class="text-muted">
            {{ translatedProperty(event.description) }}
          </p>
        </div>
      </div>
    </UCard>
  </NuxtLink>
</template>
