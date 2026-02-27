<script setup lang="ts">
import type { EventsCollectionItem } from '@nuxt/content'

defineProps<{
  event: EventsCollectionItem
}>()

const toast = useToast()
const { translatedProperty } = useContent()
const { locale, defaultLocale, t } = useSiteI18n()
const { addToCart, removeFromCart, hasItem: hasItemInCart } = useShoppingCart()

const addTicketToCart = (ticket: EventsCollectionItem['tickets'][string]) => {
  if (!ticket.stripeId) {
    // we then add teh "notstripe_safeId" to the cart"
    console.warn('Ticket does not have a stripeId!')
    return
  }

  const title = translatedProperty(ticket.name) || 'Ticket'
  addToCart({
    id: ticket.stripeId,
    title,
    description: translatedProperty(ticket.description),
    price: ticket.price,
    qty: 1,
  })
  toast.add(formatToastSuccess(t('cart.addedToCart', { title })))
}

const removeTicketFromCart = (ticket: EventsCollectionItem['tickets'][string]) => {
  if (!ticket.stripeId) return
  removeFromCart(ticket.stripeId)
  toast.add(formatToastSuccess(t('cart.removedFromCart', { title: translatedProperty(ticket.name) || 'Ticket' })))
}
</script>

<template>
  <UPageCard
    :title="$t('events.detail.tickets.title')"
  >
    <UPageList
      class="gap-4"
    >
      <div
        v-for="(ticket, key) in event.tickets"
        :key="key"
        class="pb-2 flex flex-col gap-0.5 border-b border-gray-200 last:border-b-0"
      >
        <div class="text-lg font-semibold">
          <div class="flex justify-between">
            <div class="w-2/3">
              {{ translatedProperty(ticket.name) }}
            </div>
            <UButton
              v-if="!hasItemInCart(ticket.stripeId)"
              variant="subtle"
              :trailing-icon="ticket.price > 0 ? 'i-lucide-shopping-cart' : 'i-lucide-activity'"
              @click="addTicketToCart(ticket)"
            >
              <template v-if="ticket.price">
                {{ ticket.price }} {{ ticket.currency }}
              </template>
              <template v-else>
                {{ $t('events.detail.tickets.free') }}
              </template>
            </UButton>
            <div
              v-else
              class="flex justify-end items-center gap-2"
            >
              <!--                        <div class="w-2/4"> -->
              <!--                          <UInputNumber -->
              <!--                            :default-value="getItemFromCart(ticket.stripeId)?.qty || 0" -->
              <!--                            :step="1" -->
              <!--                            @change="handleQtyChange(ticket.stripeId, $event.targe)" -->
              <!--                          /> -->
              <!--                        </div> -->
              <UButton
                color="error"
                icon="i-lucide-trash"
                variant="outline"
                @click="removeTicketFromCart(ticket)"
              />
            </div>
          </div>
        </div>
        <MDC
          v-slot="{ body, data }"
          class="text-muted"
          :value="translatedProperty(ticket.description)"
          unwrap
        >
          <MDCRenderer
            v-if="body"
            :body="body"
            :data="{ ...data, ticket: translatedProperty(ticket.name) }"
            unwrap
          />
        </MDC>
      </div>
    </UPageList>
  </UPageCard>
</template>
