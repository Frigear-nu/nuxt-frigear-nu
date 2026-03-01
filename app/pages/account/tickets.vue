<script setup lang="ts">
import { useUserEventTickets } from '~/store/queries/user'
import type { ButtonProps } from '@nuxt/ui'

const { data: tickets } = await useUserEventTickets()
const { translatedProperty } = useContent()

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

const ticketBadgeButton = (status: string): ButtonProps | undefined => {
  if (status !== 'pending') {
    return undefined
  }
  return {
    label: 'Pay now',
    color: ticketBadgeColor(status),
    trailingIcon: 'i-lucide-external-link',
    to: '/some-payment-url',
    // or:
    // onClick: () => 'create-payment-url-or-redirect-to-session'
  }
}
</script>

<template>
  <UPageGrid class="grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
    <NuxtLink
      v-for="ticket in tickets"
      :key="ticket.id"
      :to="ticket.eventPath || '/events'"
    >
      <UCard>
        <div class="flex flex-col gap-2">
          <div class="flex justify-between">
            <div class="text-xl font-bold">{{ translatedProperty(ticket.event?.name) }}</div>
            <UFieldGroup>
              <UBadge
                :color="ticketBadgeColor(ticket.status)"
                :variant="ticket.status === 'paid' ? 'subtle' : 'subtle'"
                :icon="ticketBadgeIcon(ticket.status)"
                :class="[
                  'font-extrabold',
                  ticket.status === 'paid' ? 'uppercase' : 'capitalize',
                ]"
              >
                {{ ticket.status }}
              </UBadge>
              <UButton
                v-if="ticketBadgeButton(ticket.status)"
                v-bind="ticketBadgeButton(ticket.status)"
              />
            </UFieldGroup>
          </div>

          <div>
            <div class="text-md font-semibold">
              <UBadge variant="outline">
                <b>Ticket:</b> {{ translatedProperty(ticket.event.tickets[ticket.ticketKey].name) }}
              </UBadge>
            </div>
          </div>
        </div>
      </UCard>
    </NuxtLink>
  </UPageGrid>
</template>
