import { db } from '@nuxthub/db'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)

  return await db.query.userEventTickets.findMany({
    where: (ticket, { eq }) => eq(ticket.userId, userId),
    orderBy: (ticket, { desc }) => desc(ticket.createdAt),
  })
})
