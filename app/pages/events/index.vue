<script setup lang="ts">
import type { EventsCollectionItem } from '@nuxt/content'

const [{ data: events }] = await Promise.all([
  useAsyncData<EventsCollectionItem[]>('events', async () => queryCollection('events').order('date', 'DESC').all(), { default: () => [] }),
])

const { t } = useSiteI18n()

const useEmptyOrTranslated = (key: string) => {
  const translated = t(key)
  return translated === key ? undefined : translated
}

const upcomingEvents = computed(() => {
  return events.value.filter(event => new Date(event.date) > new Date())
})
const pastEvents = computed(() => {
  return events.value.filter(event => new Date(event.date) <= new Date())
})
</script>

<template>
  <div>
    <UContainer>
      <section
        class="flex flex-col gap-8"
      >
        <UPageHeader
          :title="t('events.upcoming.title')"
          :description="useEmptyOrTranslated('events.upcoming.description')"
        />
        <UPageGrid v-if="upcomingEvents.length">
          <EventCard
            v-for="event in upcomingEvents"
            :key="event.id"
            :event="event"
          />
        </UPageGrid>
        <UEmpty
          v-else
          :title="t('events.upcoming.empty.title')"
          :description="useEmptyOrTranslated('events.upcoming.empty.description')"
        />
      </section>
      <section
        v-if="pastEvents.length"
        class="flex flex-col gap-8"
      >
        <UPageHeader
          :title="t('events.past.title')"
          :description="useEmptyOrTranslated('events.past.description')"
        />
        <UPageGrid>
          <EventCard
            v-for="event in pastEvents"
            :key="event.id"
            :event="event"
          />
        </UPageGrid>
      </section>
    </UContainer>
  </div>
</template>
