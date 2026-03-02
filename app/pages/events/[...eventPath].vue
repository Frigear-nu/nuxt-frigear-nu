<script setup lang="ts">
import type { EventsCollectionItem } from '@nuxt/content'
import { withLeadingSlash, withoutLeadingSlash } from 'ufo'
import { format } from 'date-fns'
import { useUserEventTickets } from '~/store/queries/user'
import { useUrlSearchParams } from '@vueuse/core'
import type { ButtonProps } from '@nuxt/ui'

const route = useRoute()
const { $api } = useNuxtApp()
const { translatedProperty } = useContent()
const { locale, defaultLocale, localePath, t } = useSiteI18n()
const { formatError } = useFormattedToast()
const { data: userTickets, refetch: refetchUserTickets } = useUserEventTickets()

const [{ data: event }] = await Promise.all([
  useAsyncData<EventsCollectionItem | null>(
    () => `events:${route.path}`,
    async () => {
      let fullPath = withoutLeadingSlash(route.path)

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
const checkPaymentResult = ref<'success' | 'cancel' | 'pending' | undefined>(undefined)

const onPurchase = async (input: { eventPath: string, payload: { ticketKey: string, productIds: string[] } }) => {
  isLoading.value = true
  const { eventPath, payload } = input
  const { ticketKey, productIds } = payload
  try {
    const checkoutSession = await $api(`/api/events/purchase-ticket`, {
      method: 'POST',
      body: {
        eventPath,
        ticketKey,
        productIds,
      },
    })

    if (!checkoutSession?.url) {
      toast.add(formatError(new Error('events.detail.tickets.error.purchase')))
      return
    }

    navigateTo(checkoutSession.url, { external: true })
  }
  catch (err) {
    toast.add(formatError(err))
  }
  finally {
    isLoading.value = false
  }
}

// --- Stripe return handling ---

const searchParams = useUrlSearchParams<{ payment?: 'success' | 'cancel' }>()

const checkPurchaseStatus = async () => {
  // Give Stripe's webhook a moment to process before polling
  await new Promise(resolve => setTimeout(resolve, 1500))

  await refetchUserTickets()
  const userTicketsV = toValue(userTickets)

  if (!userTicketsV) {
    checkPaymentResult.value = 'cancel'
    isCheckingPayment.value = false
    return
  }

  // Look for a ticket purchased within the last 5 minutes
  const recentlyPurchased = userTicketsV.find(
    t => t.createdAt && new Date(t.createdAt) > new Date(Date.now() - 5 * 60 * 1000),
  )

  checkPaymentResult.value = recentlyPurchased ? 'success' : 'cancel'
  isCheckingPayment.value = false
}

const paymentActions = computed<ButtonProps[]>(() => {
  if (checkPaymentResult.value === 'success') {
    return [{
      label: t('events.detail.tickets.view'),
      to: localePath('/account/tickets'),
      variant: 'subtle',
      color: 'neutral',
      trailingIcon: 'i-lucide-arrow-right',
    }]
  }

  if (checkPaymentResult.value === 'cancel') {
    // TODO: Show try again button with deep link to stripe checkout?
  }

  return []
})

const { getEventRequirements } = useEventTicket()
const eventRequirements = computed(() => {
  return getEventRequirements(event.value || [])
})

onMounted(() => {
  const payment = searchParams.payment
  if (payment === 'success' || payment === 'cancel') {
    isCheckingPayment.value = true
    checkPaymentResult.value = 'pending'

    // Since we cannot trust this, we will check via a trusted source (our API)
    if (payment === 'success') {
      checkPurchaseStatus()
    }
    else {
      // Stripe cancel is trusted directly — no need to poll
      checkPaymentResult.value = 'cancel'
      isCheckingPayment.value = false
    }
  }
})
</script>

<template>
  <UContainer v-if="event">
    <div class="flex flex-col gap-8">
      <!-- Stripe return banner -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <UAlert
          v-if="isCheckingPayment || checkPaymentResult === 'success' || checkPaymentResult === 'cancel'"
          :color="isCheckingPayment || checkPaymentResult === 'pending' ? 'neutral' : checkPaymentResult === 'success' ? 'success' : 'warning'"
          :variant="'subtle'"
          class="mt-4"
          :actions="paymentActions"
        >
          <template #leading>
            <UIcon
              v-if="isCheckingPayment || checkPaymentResult === 'pending'"
              name="i-lucide-loader-circle"
              class="animate-spin size-5"
            />
            <UIcon
              v-else-if="checkPaymentResult === 'success'"
              name="i-lucide-circle-check"
              class="size-5"
            />
            <UIcon
              v-else
              name="i-lucide-circle-x"
              class="size-5"
            />
          </template>

          <template #title>
            <span v-if="isCheckingPayment || checkPaymentResult === 'pending'">
              {{ $t('events.detail.tickets.payment.verifying.title') }}
            </span>
            <span v-else-if="checkPaymentResult === 'success'">
              {{ $t('events.detail.tickets.payment.success.title') }}
            </span>
            <span v-else>
              {{ $t('events.detail.tickets.payment.cancel.title') }}
            </span>
          </template>

          <template #description>
            <span v-if="isCheckingPayment || checkPaymentResult === 'pending'">
              {{ $t('events.detail.tickets.payment.verifying.description') }}
            </span>
            <span v-else-if="checkPaymentResult === 'success'">
              {{ $t('events.detail.tickets.payment.success.description') }}
            </span>
            <span v-else>
              {{ $t('events.detail.tickets.payment.cancel.description') }}
            </span>
          </template>
        </UAlert>
      </Transition>

      <UPageHeader
        :title="translatedProperty(event.name)"
        :description="translatedProperty(event.description)"
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
          <UBadge
            v-for="(req, index) in eventRequirements"
            :key="index"
            trailing-icon="i-lucide-triangle-alert"
            color="warning"
            variant="subtle"
          >
            {{ translatedProperty(req.title || req.type) }}
          </UBadge>
        </div>
      </UPageHeader>

      <div>
        <div class="flex flex-col md:flex-row gap-8">
          <div :class="['w-full lg:pr-8', hasAnyTickets ? 'md:w-1/2 lg:w-2/3' : '']">
            <MDC
              v-slot="{ body, data }"
              class="text-muted"
              :value="translatedProperty(event.body)"
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
