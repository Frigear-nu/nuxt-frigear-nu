<script setup lang="ts">
import type { EventsCollectionItem } from '@nuxt/content'
import { kebabCase } from 'scule'
import { withLeadingSlash } from 'ufo'

const route = useRoute()
const { addToCart, removeFromCart, hasItem: hasItemInCart } = useShoppingCart()

const [{ data: event }] = await Promise.all([
  useAsyncData<EventsCollectionItem | null>(
    () => `events:${kebabCase(Array.isArray(route.params.eventPath) ? route.params.eventPath.join('/') : route.params.eventPath || '')}`,
    async () => await queryCollection('events')
      .path(withLeadingSlash(route.fullPath))
      .first(),
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
const { locale, t } = useSiteI18n()

const useTranslatedProperty = (value: string | { [key: string]: string } | undefined): string | undefined => {
  if (!value) return undefined
  if (typeof value === 'string') {
    return value
  }
  return value[locale.value as string] || value.en || value as never
}

const addTicketToCart = (ticket: EventsCollectionItem['tickets'][string]) => {
  if (!ticket.stripeId) {
    console.warn('Ticket does not have a stripeId!')
    return
  }

  const title = useTranslatedProperty(ticket.name) || 'Ticket'
  addToCart({
    id: ticket.stripeId,
    title,
    description: useTranslatedProperty(ticket.description),
    price: ticket.price,
    qty: 1,
  })
  toast.add(formatToastSuccess(t('cart.addedToCart', { title })))
}

const removeTicketFromCart = (ticket: EventsCollectionItem['tickets'][string]) => {
  if (!ticket.stripeId) return
  removeFromCart(ticket.stripeId)
  toast.add(formatToastSuccess(t('cart.removedFromCart', { title: useTranslatedProperty(ticket.name) || 'Ticket' })))
}
</script>

<template>
  <UContainer v-if="event">
    <div class="flex flex-col gap-8">
      <UPageHeader
        :headline="new Date(event.date).toLocaleDateString()"
        :title="useTranslatedProperty(event.name)"
        :description="useTranslatedProperty(event.excerpt)"
      />
      <UMain>
        <div class="flex flex-col md:flex-row gap-4">
          <div class="w-full md:w-1/2 lg:w-2/3">
            <MDC
              :value="useTranslatedProperty(event.description)"
            />
          </div>
          <div class="w-full md:w-1/2 lg:w-1/3">
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
                        {{ useTranslatedProperty(ticket.name) }}
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
                    :value="useTranslatedProperty(ticket.description)"
                    unwrap
                  >
                    <MDCRenderer
                      v-if="body"
                      :body="body"
                      :data="{ ...data, ticket: useTranslatedProperty(ticket.name) }"
                      unwrap
                    />
                  </MDC>
                </div>
              </UPageList>
            </UPageCard>
          </div>
        </div>
      </UMain>
    </div>
  </UContainer>
</template>
