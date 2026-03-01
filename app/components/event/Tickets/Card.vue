<script setup lang="ts">
import type { RadioGroupItem } from '@nuxt/ui'
import type { EventsCollectionItem } from '@nuxt/content'
import { useLocalStorage } from '@vueuse/core'

const props = defineProps<{
  event: EventsCollectionItem
}>()

const isLoading = defineModel<boolean>('loading', { default: false })

type PurchaseEmit = { eventPath: string, payload: { ticketKey: string, productIds: string[] } }

const $emits = defineEmits<{
  (e: 'purchase', event: PurchaseEmit): void
}>()

const toast = useToast()
const { loggedIn } = useUserSession()
const { localePath } = useSiteI18n()
const { translatedProperty } = useContent()

// Ticket
const selectedTicketKey = useLocalStorage<string | null>('selected-ticket', () => props.event?.defaultTicket || null, {
  initOnMounted: true,
  listenToStorageChanges: true,
})

const ticketRadioCardItems = computed<RadioGroupItem[]>(() => {
  return Object.entries(props.event.tickets).map(([key, ticket]) => ({
    label: translatedProperty(ticket.name) || 'Ticket',
    description: translatedProperty(ticket.description),
    value: key,
    price: ticket.price,
    currency: ticket.currency,
    hidePrice: ticket.hidePrice,
  } satisfies RadioGroupItem))
})

const selectedTicket = computed(() => props.event.tickets[selectedTicketKey.value as keyof EventsCollectionItem['tickets']])
const selectedTicketHasProducts = computed(() => selectedTicket.value?.products?.items?.length > 0)
const requiresAtLeastOneProduct = computed(() => selectedTicket.value?.products?.require === 'one_of')

// Addons
const selectedProductAddons = ref<string | undefined>()
const ticketProductsRadioCardItems = computed<RadioGroupItem[]>(() => {
  if (!selectedTicket.value) {
    return []
  }

  return selectedTicket.value.products?.items.map(product => ({
    label: translatedProperty(product.label),
    description: translatedProperty(product.description),
    value: product.id,
    price: product.price,
    currency: product.currency,
  } satisfies RadioGroupItem)) as RadioGroupItem[]
})

// Reset this when the ticket changes...
watch(selectedTicket, () => {
  selectedProductAddons.value = undefined
})

const router = useRouter()
router.afterEach((to, from) => {
  if (!from.path.includes('/events/')) return

  const stripPrefixes = (path: string) => {
    path = path.replace(/^\/[a-z]{2}\//, '/')
    if (path.startsWith('/events/')) {
      path = path.slice('/events/'.length)
    }
    return path
  }

  const normTo = stripPrefixes(to.path)
  const normFrom = stripPrefixes(from.path)

  if (normTo !== normFrom) {
    selectedTicketKey.value = null
  }
})

const canPurchase = computed(() => {
  if (requiresAtLeastOneProduct.value && !selectedProductAddons.value) {
    return false
  }

  return !!selectedTicketKey.value
})

const onPurchase = () => {
  isLoading.value = true
  if (!selectedTicketKey.value) {
    toast.add(formatToastError(new Error('Please select a ticket to continue.')))
    return
  }
  $emits('purchase', {
    eventPath: props.event.path,
    payload: {
      ticketKey: selectedTicketKey.value,
      productIds: [selectedProductAddons.value].filter(Boolean) as string[],
    },
  })
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <UForm>
      <URadioGroup
        v-model="selectedTicketKey"
        color="primary"
        variant="card"
        :items="ticketRadioCardItems"
        :ui="{ item: 'light:bg-default has-data-[state=checked]:bg-primary/5', fieldset: 'gap-2' }"
      >
        <template #legend>
          <div
            class="text-lg"
          >
            {{ $t('events.detail.tickets.ticket.label') }}
          </div>
        </template>
        <template #description="{ item }">
          <MDC
            v-slot="{ body, data }"
            class="text-muted"
            :value="translatedProperty(item.description)"
            unwrap
          >
            <MDCRenderer
              v-if="body"
              :body="body"
              :data="{ ...data, ticket: item.label }"
              unwrap
            />
          </MDC>
        </template>
        <template #label="{ item }">
          <div class="flex justify-between">
            <div class="text-md font-bold">
              {{ item.label }}
            </div>
            <UBadge
              v-if="!item.hidePrice"
              variant="subtle"
              class="text-md font-semibold px-1 py-0.5"
              size="xs"
            >
              <div v-if="item.price === 0">
                {{ $t('events.detail.tickets.free') }}
              </div>
              <div v-else>
                {{ item.price }} {{ item.currency }}
              </div>
            </UBadge>
          </div>
        </template>
      </URadioGroup>
    </UForm>
    <div v-if="selectedTicketKey && selectedTicket && selectedTicketHasProducts">
      <URadioGroup
        v-model="selectedProductAddons"
        color="primary"
        variant="card"
        :items="ticketProductsRadioCardItems"
        :ui="{ item: 'light:bg-default has-data-[state=checked]:bg-primary/5', fieldset: 'gap-2' }"
      >
        <template #legend>
          <div
            class="text-lg"
          >
            {{ selectedTicket.products?.title ? translatedProperty(selectedTicket?.products.title) : $t('events.detail.tickets.products.label') }}
            <small
              v-if="requiresAtLeastOneProduct"
              class="text-muted"
            >
              ({{ $t('events.detail.tickets.products.required') }})
            </small>
          </div>
        </template>
        <template #description="{ item }">
          <MDC
            v-slot="{ body, data }"
            class="text-muted"
            :value="translatedProperty(item.description)"
            unwrap
          >
            <MDCRenderer
              v-if="body"
              :body="body"
              :data="{ ...data, ticket: item.label }"
              unwrap
            />
          </MDC>
        </template>
        <template #label="{ item }">
          <div class="flex justify-between">
            <div class="text-md font-bold">
              {{ item.label }}
            </div>
            <UBadge
              variant="subtle"
              class="text-md font-semibold px-1 py-0.5"
            >
              <div v-if="item.price === 0">
                {{ $t('events.detail.tickets.free') }}
              </div>
              <div v-else>
                {{ item.price }} {{ item.currency }}
              </div>
            </UBadge>
          </div>
        </template>
      </URadioGroup>
      <UAlert
        v-if="requiresAtLeastOneProduct && !canPurchase"
        :variant="$colorMode.value === 'dark' ? 'outline' : 'subtle'"
        icon="i-lucide-alert-triangle"
        color="warning"
        class="mt-4"
        description="You have to select at least one addon product to continue with this ticket."
      />
    </div>
    <div>
      <USeparator />
    </div>
    <div class="flex flex-col gap-2">
      <UButton
        v-if="loggedIn"
        type="button"
        trailing-icon="i-lucide-shopping-cart"
        class="w-full justify-center"
        :variant="canPurchase ? 'solid' : 'outline'"
        size="xl"
        :disabled="!canPurchase"
        :loading="isLoading"
        @click="onPurchase"
      >
        Checkout
      </UButton>
      <UButton
        v-else
        trailing-icon="i-lucide-arrow-right"
        :to="localePath(`/sign-in?redirect=${$route.fullPath}`)"
        class="w-full justify-center"
      >
        Sign in to purchase tickets
      </UButton>
    </div>
  </div>
</template>
