import { db } from '@nuxthub/db'

// NOTE: this route will have growing pains at some point, but it is not a concern at this time.
export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)

  const tickets = await db.query.userEventTickets.findMany({
    where: (ticket, { eq }) => eq(ticket.userId, userId),
    orderBy: (ticket, { desc }) => desc(ticket.createdAt),
  })

  const ticketPaths = tickets.map(ticket => ticket.eventPath)

  const events = await queryCollection(event, 'events')
    .select('path', 'name', 'tickets')
    .where('path', 'IN', ticketPaths)
    .all()

  const eventsByPath = Object.fromEntries(events.map(event => [
    event.path,
    event,
  ]))

  // TODO: might be better to return a complete "ticket"
  return tickets.map((ticket) => {
    const event = eventsByPath[ticket.eventPath] || {
      name: 'Deleted Event',
      tickets: {},
    }
    return ({
      ...ticket,
      event: {
        name: event.name,
        // Only include the ticket that is purchased.
        tickets: Object.fromEntries(Object.keys(event.tickets)
          .filter(ticketKey => ticketKey === ticket.ticketKey)
          .map(ticketKey => [ticketKey, event.tickets[ticketKey as keyof typeof event.tickets]])),
      },
    })
  })
})
