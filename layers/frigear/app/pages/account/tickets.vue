<script setup lang="ts">
import { useUserEventTickets } from '~/store/queries/user'
import { upperFirst } from 'scule'

const { data: tickets } = await useUserEventTickets()
const { t } = useSiteI18n()
const { translatedProperty } = useContent()
const toast = useToast()

// @ts-expect-error not typed...
const selectedTicket = ref<typeof tickets.value[number] | undefined>(undefined)
const displayQrCode = ref(false)

const ticketBadgeIcon = (status: string) => {
  switch (status) {
    case 'paid':
      return 'i-lucide-check'
    case 'cancelled':
      return 'i-lucide-x'
    default:
      return 'i-lucide-triangle-alert'
  }
}

const ticketBadgeColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'success'
    case 'cancelled':
      return 'error'
    default:
      return 'warning'
  }
}

const ticketStatusLabel = (status: string) => {
  switch (status) {
    case 'paid':
      return t('account.tickets.status.paid')
    case 'cancelled':
      return t('account.tickets.status.cancelled')
    case 'pending':
      return t('account.tickets.status.pending')
    case 'abandoned':
      return t('account.tickets.status.abandoned')
    default:
      return upperFirst(status)
  }
}

const loadingMap = reactive<Record<string, boolean>>({})

const onPayNow = async (userTicketId: string) => {
  loadingMap[userTicketId] = true
  try {
    const response = await $fetch<{ message: string } | { url: string }>(`/api/account/events/tickets/${userTicketId}/pay`, {
      method: 'POST',
    })

    if (!response) {
      throw createError({
        status: 400,
        message: 'Failed to pay ticket',
      })
    }

    if (response?.message) {
      toast.add({
        title: 'Message:',
        description: response.message,
      })
      return
    }

    if (!response.url) {
      throw createError({
        status: 400,
        message: 'Failed to pay ticket',
      })
    }

    return navigateTo(response.url, { external: true })
  }
  finally {
    loadingMap[userTicketId] = false
  }
}

const onClickDisplayQrCode = (ticket: typeof tickets.value[number]) => {
  selectedTicket.value = ticket
  displayQrCode.value = true
}

const onCloseDisplayQrCode = () => {
  displayQrCode.value = false
  selectedTicket.value = undefined
}
</script>

<template>
  <div>
    <UPageGrid class="grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
      <UPageCard
        v-for="ticket in tickets"
        :key="ticket.id"

        :ui="{
          header: 'flex items-start justify-between gap-2',
          body: 'flex-col gap-2',
          footer: 'flex flex-col md:flex-row gap-4',
        }"
      >
        <!-- TOP ROW: Event Name (left) + Status Badge (right) -->
        <template #header>
          <span class="text-xl font-bold">{{ translatedProperty(ticket.event?.name) }}</span>

          <UBadge
            :color="ticketBadgeColor(ticket.status)"
            variant="subtle"
            :icon="ticketBadgeIcon(ticket.status)"
            size="lg"
            :ui="{ base: 'shrink-0' }"
            :class="[ticket.status === 'paid' ? 'uppercase' : 'capitalize', 'font-extrabold']"
          >
            {{ ticketStatusLabel(ticket.status) }}
          </UBadge>
        </template>

        <!-- MIDDLE: Description text -->
        <template #body>
          <p class="text-sm text-gray-500 line-clamp-2">
            {{ translatedProperty(ticket.event?.description) }}
          </p>
          <UBadge
            variant="soft"
            :ui="{ base: 'shrink-0' }"
          >
            <b>{{ $t('account.tickets.ticket') }}:</b> {{ translatedProperty(ticket.event.tickets[ticket.ticketKey as never]?.name || 'N/A') }}
          </UBadge>
        </template>

        <!-- BOTTOM ROW: Type badge (left) + Price/Qty + Pay button (right) -->
        <template #footer>
          <UButton
            v-if="ticket.status === 'pending'"
            :label="$t('account.tickets.payNow')"
            :color="ticketBadgeColor(ticket.status)"
            trailing-icon="i-lucide-external-link"
            :loading="loadingMap[ticket.id]"
            :disabled="loadingMap[ticket.id]"
            class="justify-between"
            @click="onPayNow(ticket.id)"
          />

          <UButton
            v-if="ticket.status === 'paid'"
            :color="ticketBadgeColor(ticket.status)"
            trailing-icon="i-lucide-barcode"
            :label="$t('account.tickets.viewQrCode')"
            class="justify-between"
            @click="onClickDisplayQrCode(ticket)"
          />
          <UButton
            :to="ticket.eventPath"
            trailing-icon="i-lucide-arrow-right"
            :label="$t('account.tickets.goToEvent')"
            class="justify-between"
          />
        </template>
      </UPageCard>
    </UPageGrid>
    <UModal
      v-model:open="displayQrCode"
      :title="$t('account.tickets.ticket')"
      :ui="{ footer: 'justify-end' }"
    >
      <template
        v-if="selectedTicket"
        #body
      >
        <ClientOnly>
          <LazyQrcode :value="`urn:frigear:ticket:${selectedTicket?.id || 'NONE'}`" />
        </ClientOnly>
      </template>
      <template #footer>
        <UButton
          :label="$t('common.close')"
          @click="onCloseDisplayQrCode"
        />
      </template>
    </UModal>
  </div>
</template>
