import type { EventsCollectionItem } from '@nuxt/content'

export const useEventTicket = () => {
  const getEventRequirements = (event: EventsCollectionItem) => {
    return event?.requirements || []
  }

  const getEventTicketRequirements = (event: EventsCollectionItem) => {
    return event.tickets && Object.keys(event.tickets).length
      ? Object.keys(event.tickets).map(key => event.tickets[key]?.requirements).flat()
      : []
  }
  const getAllRequirements = (event: EventsCollectionItem) => [
    ...getEventRequirements(event),
    ...getEventTicketRequirements(event),
  ].filter(r => r?.type || r?.title)

  return {
    getEventRequirements,
    getEventTicketRequirements,
    getAllRequirements,
  }
}
