import { z } from 'zod/v4'
import { db, schema } from '@nuxthub/db'
import type Stripe from 'stripe'
import { eq } from 'drizzle-orm'
import { withQuery } from 'ufo'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)

  const { ticketId } = await getValidatedRouterParams(event, z.object({
    ticketId: z.string(),
  }).parse)

  let ticket = await db.query.userEventTickets.findFirst({
    where: (ticket, { eq, and }) => {
      return and(eq(ticket.id, ticketId), eq(ticket.userId, userId))
    },
  })

  if (!ticket) {
    throw createError({
      status: 404,
      message: 'Ticket not found',
    })
  }

  const dbEvent = await queryCollection(event, 'events')
    .path(ticket.eventPath)
    .first()

  if (!dbEvent) {
    throw createError({
      status: 404,
      message: 'Event not found',
    })
  }

  const stripeCustomer = await db.query.stripeCustomers.findFirst({
    where: (customer, { eq }) => eq(customer.userId, userId),
  })

  if (!stripeCustomer) {
    throw createError({
      status: 500,
      message: 'Stripe customer not found',
    })
  }

  const stripe = useTaskStripe()

  const lineItems = ticket.priceIds?.map(price => ({ price, quantity: 1 })) || []

  // if there are no items, AND not priceId, we will simply mark it as paid...
  if (lineItems.length === 0) {
    await db.update(schema.userEventTickets).set({
      status: 'paid',
    }).where(eq(schema.userEventTickets.id, ticketId))
    return {
      message: 'Ticket marked as paid',
    }
  }

  const returnUrl = withBaseUrl(dbEvent.path)

  const createCheckoutSession = async () => await stripe.checkout.sessions.create({
    customer: stripeCustomer.id,
    line_items: lineItems,
    success_url: withQuery(returnUrl, { payment: 'success' }),
    cancel_url: withQuery(returnUrl, { payment: 'cancel' }),
    metadata: { type: 'ticket' },
    // TODO: server side locale...
    // locale: locale as never, // we assume this is OK
  })

  // check if the checkoutSession is already created
  let checkoutSession: Stripe.Checkout.Session | null = null
  if (!ticket.checkoutSessionId) {
    checkoutSession = await createCheckoutSession()
  }
  else {
    const existingSession = await stripe.checkout.sessions.retrieve(ticket.checkoutSessionId)

    // and if still valid... otherwise create
    if (existingSession.status === 'open') {
      checkoutSession = existingSession
    }
    else if (existingSession.status === 'expired') {
      checkoutSession = await createCheckoutSession()
    }
    else if (existingSession.status === 'complete') {
      return {
        message: 'Ticket already paid',
      }
    }
  }

  if (!checkoutSession) {
    throw createError({
      status: 500,
      message: 'Could not create checkout session',
    })
  }

  // ensure we update the tickets checkout session id in case it has changed
  if (ticket.checkoutSessionId && ticket.checkoutSessionId !== checkoutSession.id) {
    const [newTicket] = await db
      .update(schema.userEventTickets)
      .set({
        checkoutSessionId: checkoutSession.id,
      })
      .where(eq(schema.userEventTickets.id, ticketId))
      .returning()

    if (!newTicket) {
      throw createError({
        status: 500,
        message: 'Could not update ticket checkout session id',
      })
    }
    // the updated ticket...
    ticket = newTicket
  }

  if (!checkoutSession.url) {
    throw createError({
      status: 500,
      message: 'No checkouts session URL returned from stripe.',
    })
  }

  return {
    url: checkoutSession.url,
  }
})
