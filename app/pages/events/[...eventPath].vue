<script setup lang="ts">
import type { EventsCollectionItem } from '@nuxt/content'
import { kebabCase } from 'scule'
import { withLeadingSlash } from 'ufo'
import { format } from 'date-fns'

const route = useRoute()
const { translatedProperty } = useContent()
const { locale, defaultLocale } = useSiteI18n()

const [{ data: event }] = await Promise.all([
  useAsyncData<EventsCollectionItem | null>(
    () => `events:${kebabCase(Array.isArray(route.params.eventPath) ? route.params.eventPath.join('/') : route.params.eventPath || '')}`,
    async () => {
      let fullPath = route.fullPath

      // check if /en/...
      if (locale.value !== defaultLocale.value && fullPath.startsWith(withLeadingSlash(locale.value))) {
        fullPath = fullPath.split('/').slice(2).join('/')
      }

      return await queryCollection('events')
        .path(withLeadingSlash(fullPath))
        .first()
    },
    { immediate: true },
  ),
])

if (!event.value) {
  throw createError({
    status: 404,
    message: 'Event not found',
  })
}

const toast = useToast()

const eventDate = computed(() => {
  return event.value?.date ? new Date(event.value.date) : undefined
})

const startDate = computed(() => {
  return event.value?.start ? new Date(event.value.start) : undefined
})

const endDate = computed(() => {
  return event.value?.end ? new Date(event.value.end) : undefined
})

const hasAnyTickets = computed(() => {
  return event.value.tickets && Object.keys(event.value.tickets).length > 0
})
</script>

<template>
  <UContainer v-if="event">
    <div class="flex flex-col gap-8">
      <UPageHeader
        :title="translatedProperty(event.name)"
        :description="translatedProperty(event.excerpt)"
      >
        <div class="flex gap-2 mt-2">
          <UBadge
            v-if="startDate"
            variant="subtle"
            class="text-sm"
            size="sm"
          >
            <strong>Starts:</strong> {{ format(startDate, 'PPP') }}
          </UBadge>
          <UBadge
            v-if="endDate"
            variant="subtle"
            class="text-sm"
            size="sm"
          >
            <strong>Ends:</strong> {{ format(endDate, 'PPP') }}
          </UBadge>
        </div>
      </UPageHeader>
      <div>
        <div class="flex flex-col md:flex-row gap-8">
          <div :class="['w-full lg:pr-8', hasAnyTickets ? 'md:w-1/2 lg:w-2/3' : '']">
            <MDC
              :value="translatedProperty(event.description)"
              unwrap="div"
            />
          </div>
          <div
            v-if="hasAnyTickets"
            class="w-full md:w-1/2 lg:w-1/3 flex flex-col gap-4"
          >
            <h2 class="text-2xl font-bold">
              {{ $t('events.detail.tickets.title') }}
            </h2>
            <UPageCard :variant="$colorMode.value === 'dark' ? 'subtle' : 'soft'">
              <EventTicketsNewCard :event="event" />
            </UPageCard>
          </div>
        </div>
      </div>
    </div>
  </UContainer>
</template>
