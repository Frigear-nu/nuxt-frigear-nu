<script setup lang="ts">
import type { RadioGroupItem } from '@nuxt/ui'
import type { EventsCollectionItem } from '@nuxt/content'
import { useLocalStorage } from '@vueuse/core'

const props = defineProps<{
  event: EventsCollectionItem
}>()

const { translatedProperty } = useContent()
const selectedTicketKey = ref<string | undefined>(props.event?.defaultTicket)

const ticketRadioCardItems = computed<RadioGroupItem[]>(() => {
  return Object.entries(props.event.tickets).map(([key, ticket]) => ({
    label: translatedProperty(ticket.name) || 'Ticket',
    description: translatedProperty(ticket.description),
    value: key,
    price: ticket.price,
    currency: ticket.currency,
  } satisfies RadioGroupItem))
})

const selectedTicket = computed(() => props.event.tickets[selectedTicketKey.value as keyof EventsCollectionItem['tickets']])

const selectedTicketHasProducts = computed(() => selectedTicket.value?.products?.items?.length > 0)
const requiresAtLeastOneProduct = computed(() => selectedTicket.value?.products?.require === 'one_of')

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

const canPurchase = computed(() => {
  if (requiresAtLeastOneProduct.value && !selectedProductAddons.value) {
    return false
  }

  return !!selectedTicketKey.value
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div>
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
            <div>{{ item.label }}</div>
            <UBadge
              variant="subtle"
              class="text-md font-bold"
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
    </div>
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
            {{ $t('events.detail.tickets.products.label') }}
            <small class="text-muted">
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
            <div>{{ item.label }}</div>
            <UBadge
              variant="subtle"
              class="text-md font-bold"
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
        trailing-icon="i-lucide-shopping-cart"
        class="w-full justify-center"
        :variant="canPurchase ? 'solid' : 'outline'"
        size="xl"
        :disabled="!canPurchase"
      >
        Checkout
      </UButton>
    </div>
  </div>
</template>
