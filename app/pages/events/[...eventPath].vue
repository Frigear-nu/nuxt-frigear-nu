<script setup lang="ts">
import type { EventsCollectionItem } from '@nuxt/content'
import { withLeadingSlash, withoutLeadingSlash } from 'ufo'
import { format } from 'date-fns'

const route = useRoute()
const { $api } = useNuxtApp()
const { translatedProperty } = useContent()
const { locale, defaultLocale } = useSiteI18n()
const { formatError } = useFormattedToast()

const { data: event } = await useAsyncData<EventsCollectionItem | null>(
  () => `events:${route.path}`, // route.path is unambiguous
  async () => {
    let fullPath = withoutLeadingSlash(route.path)

    // Strip any locale prefix (e.g. "en/", "fr/")
    const localePrefix = withoutLeadingSlash(locale.value) + '/'
    if (locale.value !== defaultLocale.value && fullPath.startsWith(localePrefix)) {
      fullPath = fullPath.slice(localePrefix.length)
    }

    return await queryCollection('events')
      .path(withLeadingSlash(fullPath))
      .first()
  },
  { watch: [() => route.path] },
)

if (!event.value) {
  throw createError({
    status: 404,
    message: 'Event not found',
  })
}

const toast = useToast()

const startDate = computed(() => {
  return event.value?.start ? new Date(event.value.start) : undefined
})

const endDate = computed(() => {
  return event.value?.end ? new Date(event.value.end) : undefined
})

const hasAnyTickets = computed(() => {
  return event.value?.tickets && Object.keys(event.value.tickets).length > 0
})

const isLoading = ref(false)
const isCheckingPayment = ref(false)
const checkPaymentResult = ref<'success' | 'cancel' | undefined>(undefined)

const onPurchase = async (input: { eventPath: string, payload: { ticketKey: string, productIds: string[] } }) => {
  isLoading.value = true
  const { eventPath, payload } = input
  const { ticketKey, productIds } = payload
  try {
    console.log('onPurchase', { eventPath, ticketKey, productIds })
    const checkoutSession = await $api(`/api/events/purchase-ticket`, {
      method: 'POST',
      body: {
        eventPath,
        ticketKey,
        productIds,
      },
    })

    console.log('checkoutSession', checkoutSession)
    if (!checkoutSession || !checkoutSession.url) {
      toast.add(formatError(new Error('events.detail.tickets.error.purchase')))
      return
    }

    navigateTo(checkoutSession.url, {
      external: true,
    })

    toast.add({
      title: 'Ticket purchased successfully!',
      close: false,
      actions: [{
        label: 'Complete purchase',
        trailingIcon: 'i-lucide-arrow-right',
        to: checkoutSession?.url || undefined,
        color: 'primary',
      }],
    })
  }
  catch (err) {
    toast.add(formatError(err))
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <UContainer v-if="event">
    <div class="flex flex-col gap-8">
      <UAlert
        v-if="isCheckingPayment || checkPaymentResult"
      >
        <template #description>
          <UIcon
            name="i-lucide-cvw"
            class="animate animate-spin"
          />
          {{ checkPaymentResult }}
        </template>
      </UAlert>
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
            <h2 class="text-2xl font-bold block lg:hidden">
              {{ $t('events.detail.tickets.title') }}
            </h2>
            <UPageCard :variant="$colorMode.value === 'dark' ? 'outline' : 'soft'">
              <EventTicketsCard
                v-model:loading="isLoading"
                :event="event"
                @purchase="onPurchase"
              />
            </UPageCard>
          </div>
        </div>
      </div>
    </div>
  </UContainer>
</template>
