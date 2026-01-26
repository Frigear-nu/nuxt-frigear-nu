import type { NewStripePrices, NewStripeProducts, NewStripeSubscriptions } from 'hub:db:schema'
import { eq } from 'drizzle-orm'
import type Stripe from 'stripe'
import type { H3Event } from 'h3'
import { addDays, addMonths } from 'date-fns'

export const consumeStripeWebhook = async (event: H3Event, stripeEvent: Stripe.Event) => {
  switch (stripeEvent.type) {
    case 'product.created':
    case 'product.updated':
      await upsertStripeProduct(stripeEvent)
      break
    case 'product.deleted':
      await deleteStripeProduct(stripeEvent)
      break
    case 'price.created':
    case 'price.updated':
      await upsertStripePrice(stripeEvent)
      break
    case 'price.deleted':
      await deleteStripePrice(stripeEvent)
      break
    case 'customer.created':
    case 'customer.updated':
      await upsertStripeCustomer(stripeEvent)
      break
    case 'customer.deleted':
      await deleteStripeCustomer(stripeEvent)
      break
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.paused':
      await upsertStripeCustomerSubscription(stripeEvent)
      break
    case 'customer.subscription.deleted':
      // FIXME: Might want to silently drop this
      throw createError({ statusCode: 400, message: 'Event not handled yet.' })

    default:
      return { statusCode: 200 }
  }

  return { statusCode: 200 }
}

export const transformStripeProduct = (
  data: Stripe.ProductCreatedEvent['data'] | Stripe.ProductUpdatedEvent['data'],
): NewStripeProducts => {
  const p = data.object

  return {
    id: p.id,
    active: p.active,
    name: p.name,
    description: p.description,
    image: p.images?.[0] ?? null,
    metadata: p.metadata,
    taxCodeId: typeof p.tax_code === 'string'
      ? p.tax_code
      : p.tax_code?.id ?? null,
  }
}

export const upsertStripeProduct = async (
  stripeEvent: Stripe.ProductCreatedEvent | Stripe.ProductUpdatedEvent,
) => {
  const { id, ...remaining } = transformStripeProduct(stripeEvent.data)

  return db
    .insert(schema.stripeProducts)
    .values({ id, ...remaining })
    .onConflictDoUpdate({
      target: schema.stripeProducts.id,
      set: remaining,
    })
    .returning()
}

export const deleteStripeProduct = async (stripeEvent: Stripe.ProductDeletedEvent) => {
  const productId = stripeEvent.data.object.id
  await db.delete(schema.stripeProducts).where(eq(schema.stripeProducts.id, productId))
}

export const transformStripePrice = (
  data: Stripe.PriceCreatedEvent['data'] | Stripe.PriceUpdatedEvent['data'],
): NewStripePrices => {
  const p = data.object
  const r = p.recurring

  if (p.type === 'one_time') {
    throw new Error('Only recurring prices are supported.')
  }

  // FIXME: What if the product does not exist yet?
  return {
    id: p.id,
    active: p.active,
    productId: typeof p.product === 'string' ? p.product : p.product.id,
    unitAmount: p.unit_amount ?? 0, // FIXME: Might want to allow null in this col
    currency: p.currency,
    type: p.type,
    // FIXME: This might be empty?
    interval: r ? r.interval : 'week',
    intervalCount: r ? r.interval_count : 0,
    trialPeriodDays: r ? r.trial_period_days ?? 0 : 0,
    metadata: p.metadata,
  }
}

export const upsertStripePrice = async (stripeEvent: Stripe.PriceCreatedEvent | Stripe.PriceUpdatedEvent) => {
  const { id, ...remaining } = transformStripePrice(stripeEvent.data)

  // TODO: Ensure that the product exist?
  return db
    .insert(schema.stripePrices)
    .values({ id, ...remaining })
    .onConflictDoUpdate({
      target: schema.stripePrices.id,
      set: remaining,
    })
    .returning()
}

export const deleteStripePrice = async (stripeEvent: Stripe.PriceDeletedEvent) => {
  const priceId = stripeEvent.data.object.id

  await db.delete(schema.stripePrices).where(eq(schema.stripePrices.id, priceId))
}

export const upsertStripeCustomer = async (e: Stripe.CustomerCreatedEvent | Stripe.CustomerUpdatedEvent) => {
  const c = e.data.object

  if (!c.email) return

  const matchedUser = await findUserByEmail(c.email)

  if (!matchedUser) return

  await db
    .insert(schema.stripeCustomers)
    .values({
      id: c.id,
      userId: matchedUser.id,
    })
    .onConflictDoUpdate({
      target: schema.stripeCustomers.id,
      set: { userId: matchedUser.id },
    })
}

export const deleteStripeCustomer = async (stripeEvent: Stripe.CustomerDeletedEvent) => {
  // FIXME: What behavior are we expecting here?

  // For now the behavior is to simply unlink the user-stripe customer
  await db
    .delete(schema.stripeCustomers)
    .where(eq(schema.stripeCustomers.id, stripeEvent.data.object.id))
}

export const transformStripeSubscription = (
  stripeEvent: Stripe.CustomerSubscriptionCreatedEvent | Stripe.CustomerSubscriptionUpdatedEvent | Stripe.CustomerSubscriptionPausedEvent | Stripe.CustomerSubscriptionResumedEvent,
): NewStripeSubscriptions => {
  const sub = stripeEvent.data.object
  const items = sub.items?.data || []
  const [item] = items

  if (!item && items.length !== 0) {
    throw new Error('Subscription has too many items attached, expected 1.')
  }

  const price = item?.price

  if (!price) {
    throw new Error('Subscription has no price attached.')
  }

  const currentPeriodStart = new Date(sub.start_date)
  let currentPeriodEnd: Date = addDays(currentPeriodStart, 1)

  if (price.recurring) {
    switch (price.recurring.interval) {
      case 'week':
        currentPeriodEnd = addDays(currentPeriodStart, 7)
        break
      case 'month':
        currentPeriodEnd = addMonths(currentPeriodStart, 1)
        break
      case 'year':
        currentPeriodEnd = addMonths(currentPeriodStart, 12)
        break
    }
  }

  return {
    id: sub.id,
    customerId: typeof sub.customer === 'string'
      ? sub.customer
      : sub.customer.id,
    status: sub.status,
    metadata: sub.metadata,
    priceId: price.id,
    quantity: item.quantity,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    created: new Date(sub.created),
    currentPeriodStart: new Date(sub.start_date),
    currentPeriodEnd,
  }
}

export const upsertStripeCustomerSubscription = async (
  stripeEvent: Stripe.CustomerSubscriptionCreatedEvent | Stripe.CustomerSubscriptionUpdatedEvent | Stripe.CustomerSubscriptionPausedEvent | Stripe.CustomerSubscriptionResumedEvent,
) => {
  const { id, ...remaining } = transformStripeSubscription(stripeEvent)

  await db
    .insert(schema.stripeSubscriptions)
    .values({ id, ...remaining })
    .onConflictDoUpdate({
      target: schema.stripeSubscriptions.id,
      set: remaining,
    })
}
