<script setup lang="ts">
import type { EventsCollectionItem } from '@nuxt/content'
import { withLeadingSlash, withoutLeadingSlash } from 'ufo'
import { format } from 'date-fns'
import { objectDot } from '#shared/object'
import { useUserEventTickets } from '~/store/queries/user'
import { useUrlSearchParams } from '@vueuse/core'

const route = useRoute()
const { $api } = useNuxtApp()
const { translatedProperty } = useContent()
const { locale, defaultLocale } = useSiteI18n()
const { formatError } = useFormattedToast()
const { data: userTickets, refetch: refetchUserTickets } = useUserEventTickets()

const [{ data: event }] = await Promise.all([
  useAsyncData<EventsCollectionItem | null>(
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
  ),
])

if (!event.value) {
  throw createError({
    status: 404,
    message: 'Event not found',
  })
}

const toast = useToast()

const templateVariables = computed(() => {
  const eventV = toValue(event)
  return {
    $event: {
      ...eventV || {},
      name: translatedProperty(eventV?.name),
      description: translatedProperty(eventV?.description),
    },
  }
})

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

// returning from stripe...

// We do not trust this, but it will determine if we will poll for a payment.
const searchParams = useUrlSearchParams<{ payment?: 'success' | 'cancel' }>()

const checkPurchaseStatus = async () => {
  //
  setTimeout(async () => {
    await refetchUserTickets()
    const userTicketsV = toValue(userTickets)
    if (!userTicketsV) return

    console.log('userTicketsV', userTicketsV)

    // Check if th euser within the last 5 minutes purchased a ticket.
    const lastPurchased = userTicketsV.find(t => t.createdAt && new Date(t.createdAt) > new Date(Date.now() - 5 * 60 * 1000))
    if (!lastPurchased) {
      isCheckingPayment.value = false
      checkPaymentResult.value = 'cancel'
      return
    }
    checkPaymentResult.value = 'YOU GOT IT!'
    isCheckingPayment.value = false
  })
}

onMounted(() => {
  if (searchParams && searchParams.payment) {
    checkPaymentResult.value = searchParams.payment + ' STAT'
    isCheckingPayment.value = true
    checkPurchaseStatus()
  }
})
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
              v-slot="{ body, data }"
              class="text-muted"
              :value="translatedProperty(event.description)"
            >
              <MDCRenderer
                v-if="body"
                :body="body"
                :data="{ ...data, ...templateVariables }"
                unwrap="div"
              />
            </MDC>
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
