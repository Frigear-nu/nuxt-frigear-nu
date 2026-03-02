import { db } from '@nuxthub/db'
import { eventPurchaseTicketsSchema } from '#shared/schema/events'
import { withQuery } from 'ufo'
import { checkTicketRequirements } from '#shared/events/requirements'

const isStripeProductOrPriceId = (id: string) => id.startsWith('prod_') || id.startsWith('price_')

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)

  const {
    eventPath,
    ticketKey,
    productIds: inputProductIds,
    locale,
  } = await readValidatedBody(event, eventPurchaseTicketsSchema.parse)

  const dbEvent = await queryCollection(event, 'events')
    .path(eventPath)
    .first()

  const productIds = inputProductIds.filter((id) => {
    // check that it is actually in the event
    return dbEvent?.tickets[ticketKey]?.products?.items.some(p => p.id === id)
  })

  if (!dbEvent) {
    throw createError({
      status: 404,
      message: 'Event not found',
    })
  }

  // Check that the ticket key is valid
  const ticketToPurchase = dbEvent.tickets[ticketKey]
  if (!ticketToPurchase) {
    throw createError({
      status: 404,
      message: 'Ticket not found',
    })
  }

  const userWithStripeCustomers = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
    with: {
      stripeCustomers: true,
      tickets: {
        where: (tickets, { eq }) => eq(tickets.eventPath, dbEvent.path),
      },
    },
  })

  if (!userWithStripeCustomers) {
    throw createError({
      status: 404,
      message: 'User not found',
    })
  }

  // Get first available...
  const stripeCustomer = userWithStripeCustomers.stripeCustomers.find(customer => customer.userId === userId)

  if (!stripeCustomer) {
    // TODO: Make the stripe customer? but should probably exist...
    throw createError({
      status: 404,
      message: 'No stripe customer found',
    })
  }

  // We also extract the current memberships, to test any requirements
  if (dbEvent.requirements?.length || ticketToPurchase.requirements?.length) {
    const userSubscriptions = await db.query.stripeSubscriptions.findMany({
      where: (subscriptions, { eq }) => {
        return eq(subscriptions.customerId, stripeCustomer.id)
      },
    }) as { priceId: string }[]

    // TODO: Test event requirements - since it is not implemented
    const { success, failed } = checkTicketRequirements(ticketToPurchase, userSubscriptions)
    if (!success) {
      throw createError({
        status: 400,
        message: failed.map(r => r.title.en || r.title).join(', '),
      })
    }
  }

  // add all items to a session - ensure they are prod_ or price_
  const stripe = useTaskStripe()
  const checkoutItems: { price: string, quantity: number }[] = []

  // If this is a "FREE" ticket, we will not include it in the session
  const resolveStripePriceId = async (priceOrProductId: string) => {
    if (priceOrProductId && priceOrProductId.startsWith('price_')) {
      const stripePrice = await stripe.prices.retrieve(priceOrProductId)

      if (stripePrice) {
        return stripePrice.id
      }
    }
    else if (priceOrProductId && priceOrProductId.startsWith('prod_')) {
      const ticketProduct = await stripe.products.retrieve(priceOrProductId)
      if (ticketProduct) {
        const defaultPriceId = typeof ticketProduct.default_price === 'string'
          ? ticketProduct.default_price
          : ticketProduct.default_price?.id

        if (defaultPriceId) {
          return defaultPriceId
        }
      }
    }

    return null
  }

  const ticketPriceId = ticketToPurchase.stripeId ? await resolveStripePriceId(ticketToPurchase.stripeId) : null

  if (ticketPriceId) {
    checkoutItems.push({ price: ticketPriceId, quantity: 1 })
  }

  if (ticketToPurchase.products && ticketToPurchase.products.require === 'one_of') {
    // Ensure at least ONE of the products are in the "productIds" arr
    if (!productIds.some(id => ticketToPurchase.products?.items.some(p => p.id === id))) {
      throw new Error('events.detail.tickets.requires_one')
    }
  }

  const productPriceMap = new Map<string, string>()
  if (productIds && productIds.length > 0) {
    const stripePrices = Array.from(await Promise.all(productIds.map(async (productId) => {
      if (isStripeProductOrPriceId(productId)) {
        const resolvedId = await resolveStripePriceId(productId)

        // We need to store this for later, only since we support both product/price ids.
        if (productId.startsWith('prod_') && resolvedId && !productPriceMap.has(productId)) {
          // This should now be a priceId
          productPriceMap.set(productId, resolvedId)
        }

        return resolvedId
      }
      return null
    }))).filter(p => typeof p === 'string')

    checkoutItems.push(...stripePrices.map(price => ({ price, quantity: 1 })))
  }

  if (checkoutItems.length === 0) {
    throw new Error('events.detail.tickets.noTicketSelected')
  }

  const returnUrl = withBaseUrl(dbEvent.path)
  const checkout = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: stripeCustomer.id,
    line_items: checkoutItems,
    // We want to forward state but keep the user on the event for convenience
    // in either scenario; this is not a trusted key, both will check DB in the background
    // it will show a "loading" tag in the top of the page, and then based on check show a correct status.
    success_url: withQuery(returnUrl, { payment: 'success' }),
    cancel_url: withQuery(returnUrl, { payment: 'cancel' }),
    // Added to make sure we can route this to the correct handler when we receive a webhook
    metadata: { type: 'ticket' },
    locale: locale as never, // we assume this is OK
    // TODO: discounts?
  })

  const [userTicket] = await db
    .insert(schema.userEventTickets)
    .values({
      status: 'pending',
      checkoutSessionId: checkout.id,
      userId,
      eventPath,
      ticketKey,
      stripeId: ticketToPurchase.stripeId,
      priceIds: checkoutItems.map(item => item.price),
      // TODO: This is not working, but we should be able to use the productIds to map to the priceIds
      // This is a bit of a hack, but it works for now.
      // allows mapping prod_abc to price_xyz
      // productPriceMapping: productPriceMap.size > 0
      //   ? Object.fromEntries(productPriceMap.entries())
      //   : undefined,
    })
    .returning()

  if (!userTicket) {
    await stripe.checkout.sessions.expire(checkout.id)
    throw createError({
      status: 500,
      message: 'Could not create ticket',
    })
  }

  return {
    url: checkout.url,
    ticket: userTicket,
  }
})
