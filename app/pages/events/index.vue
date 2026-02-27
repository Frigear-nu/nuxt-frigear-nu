<script setup lang="ts">
import type { EventsCollectionItem } from '@nuxt/content'

const [{ data: events }] = await Promise.all([
  useAsyncData<EventsCollectionItem[]>('events', async () => queryCollection('events').order('date', 'DESC').all(), { default: () => [] }),
])

const { locale, t } = useSiteI18n()

const useTranslatedProperty = (value: string | { [key: string]: string }): string => {
  if (typeof value === 'string') {
    return value
  }
  return value[locale.value as string] || value.en || value as never
}
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
          :title="$t('events.upcoming.title')"
          :description="useEmptyOrTranslated('events.upcoming.description')"
        />
        <UPageGrid v-if="upcomingEvents.length">
          <UPageCard
            v-for="event in upcomingEvents"
            :key="event.id"
            :title="useTranslatedProperty(event.name)"
            :description="useTranslatedProperty(event.excerpt)"
            :to="event.path"
          >
            <UBadge>{{ new Date(event.date).toLocaleDateString() }}</UBadge>
          </UPageCard>
        </UPageGrid>
        <UEmpty
          v-else
          :title="$t('events.upcoming.empty.title')"
          :description="useEmptyOrTranslated('events.upcoming.empty.description')"
        />
      </section>
      <section
        v-if="pastEvents.length"
        class="flex flex-col gap-8"
      >
        <UPageHeader
          :title="$t('events.past.title')"
          :description="useEmptyOrTranslated('events.past.description')"
        />
        <UPageGrid>
          <UPageCard
            v-for="event in upcomingEvents"
            :key="event.id"
            :title="useTranslatedProperty(event.name)"
            :description="useTranslatedProperty(event.excerpt)"
          />
        </UPageGrid>
      </section>
    </UContainer>
  </div>
</template>
