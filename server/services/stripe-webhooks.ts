import type { NewStripePrices, NewStripeProducts, NewStripeSubscriptions } from 'hub:db:schema'
import { eq } from 'drizzle-orm'
import type Stripe from 'stripe'
import type { H3Event } from 'h3'
import { fromUnixTime } from 'date-fns'
import { useServerStripe } from '#stripe/server'

const debugPayment = (...args: unknown[]) => {
  if (!import.meta.dev) {
    return
  }

  console.debug('[stripe-webhooks]', ...args)
}

export const consumeStripeWebhook = async (event: H3Event, stripeEvent: Stripe.Event) => {
  const stripe = useServerStripe(event)

  switch (stripeEvent.type) {
    case 'product.created':
    case 'product.updated':
      await upsertStripeProduct(stripeEvent.data.object)
      break
    case 'product.deleted':
      await deleteStripeProduct(stripeEvent.data.object)
      break
    case 'price.created':
    case 'price.updated':
      await upsertStripePrice(stripe, stripeEvent.data.object)
      break
    case 'price.deleted':
      await deleteStripePrice(stripeEvent.data.object)
      break
    case 'customer.created':
    case 'customer.updated':
      await upsertStripeCustomer(stripeEvent.data.object)
      break
    case 'customer.deleted':
      await deleteStripeCustomer(stripeEvent.data.object)
      break
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.paused':
      await upsertStripeCustomerSubscription(stripeEvent.data.object)
      break
    case 'customer.subscription.deleted':
      await deleteStripeCustomerSubscription(stripeEvent.data.object)
      break
    // case 'payment_method.attached':
    //   // FIXME: We should probably handle this somehow.
    //   debugPayment('FIXME!')
    //   debugPayment(stripeEvent.data.object)
    //   break
    default:
      return { status: 200 }
  }

  return { status: 200 }
}

export const transformStripeProduct = (p: Stripe.Product): NewStripeProducts => {
  return {
    id: p.id,
    active: p.active,
    name: p.name,
    description: p.description,
    images: p.images || [],
    metadata: p.metadata,
    taxCodeId: typeof p.tax_code === 'string'
      ? p.tax_code
      : p.tax_code?.id ?? null,
  }
}

export const upsertStripeProduct = async (
  stripeProduct: Stripe.Product,
) => {
  debugPayment('Upserting product', stripeProduct)
  const { id, ...remaining } = transformStripeProduct(stripeProduct)

  return db
    .insert(schema.stripeProducts)
    .values({ id, ...remaining })
    .onConflictDoUpdate({
      target: schema.stripeProducts.id,
      set: remaining,
    })
    .returning()
}

export const deleteStripeProduct = async (product: Stripe.Product) => {
  await db
    .delete(schema.stripeProducts)
    .where(eq(schema.stripeProducts.id, product.id))
}

const canIngestPrice = (p: Stripe.Price) => {
  return p.type === 'recurring'
}

export const transformStripePrice = (p: Stripe.Price): NewStripePrices => {
  const recurring = p.recurring

  // FIXME: In V1 this should probably be reworked
  if (!canIngestPrice(p)) {
    throw new Error('Only recurring prices are supported.')
  }

  // FIXME: What if the product does not exist yet?
  return {
    id: p.id,
    active: p.active,
    productId: typeof p.product === 'string' ? p.product : p.product.id,
    unitAmount: p.unit_amount ?? 0, // FIXME: Might want to allow null in this col or drop prices w/o a price?
    currency: p.currency,
    description: p.nickname,
    type: p.type,
    // FIXME: This could be NULL if it is a one-time price...
    interval: recurring ? recurring.interval : 'week',
    intervalCount: recurring ? recurring.interval_count : 0,
    trialPeriodDays: recurring ? recurring.trial_period_days ?? 0 : 0,
    lookupKey: p.lookup_key,
    metadata: p.metadata,
  }
}

export const upsertStripePrice = async (stripe: Stripe, price: Stripe.Price) => {
  if (!canIngestPrice(price)) return

  const { id, ...remaining } = transformStripePrice(price)

  return db
    .insert(schema.stripePrices)
    .values({ id, ...remaining })
    .onConflictDoUpdate({
      target: schema.stripePrices.id,
      set: remaining,
    })
    .returning()
}

export const deleteStripePrice = async (price: Stripe.Price) => {
  await db
    .delete(schema.stripePrices)
    .where(eq(schema.stripePrices.id, price.id))
}

export const upsertStripeCustomer = async (c: Stripe.Customer) => {
  if (!c.email) return

  let matchedUser = await findUserByEmail(c.email)

  if (!matchedUser) {
    const [createdUser] = await db
      .insert(schema.users)
      .values({ email: c.email, name: c.name ?? c.email })
      .returning()

    if (!createdUser) {
      throw new Error('Could not create user for Stripe customer.')
    }

    matchedUser = createdUser
  }

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

export const deleteStripeCustomer = async (customer: Stripe.Customer) => {
  // FIXME: What behavior are we expecting here?

  // For now the behavior is to simply unlink the user-stripe customer, but we might want to also delete the user?
  await db
    .delete(schema.stripeCustomers)
    .where(eq(schema.stripeCustomers.id, customer.id))
}

export const transformStripeSubscription = (
  sub: Stripe.Subscription,
): NewStripeSubscriptions => {
  const items = sub.items?.data || []

  if (items.length === 0) {
    throw new Error('Subscription has zero items!')
  }

  const [item] = items

  if (!item) {
    throw new Error('Could not find first subscription item.')
  }

  const price = item?.price

  if (!price) {
    throw new Error('Subscription has no price attached.')
  }

  return {
    id: sub.id,
    customerId: typeof sub.customer === 'string'
      ? sub.customer
      : sub.customer.id,
    status: sub.status,
    metadata: sub.metadata,
    priceId: price.id,
    quantity: item.quantity ?? 1,
    items: items.map(({ id, current_period_start, current_period_end, price: { id: priceId } }) => ({
      id,
      priceId,
      current_period_start,
      current_period_end,
    })),
    created: fromUnixTime(sub.created),
    currentPeriodStart: fromUnixTime(item.current_period_start),
    currentPeriodEnd: fromUnixTime(item.current_period_end),
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    cancelAt: sub.cancel_at ? fromUnixTime(sub.cancel_at) : null,
    cancellationDetails: sub.cancellation_details || null,
  }
}

export const upsertStripeCustomerSubscription = async (
  subscription: Stripe.Subscription,
) => {
  const { id, ...remaining } = transformStripeSubscription(subscription)

  debugPayment('Upserting subscription', subscription)

  await db
    .insert(schema.stripeSubscriptions)
    .values({ id, ...remaining })
    .onConflictDoUpdate({
      target: schema.stripeSubscriptions.id,
      set: remaining,
    })
}

export const deleteStripeCustomerSubscription = async (subscription: Stripe.Subscription) => {
  await db
    .delete(schema.stripeSubscriptions)
    .where(eq(schema.stripeSubscriptions.id, subscription.id))
}

export const transformStripePaymentMethod = (pm: Stripe.PaymentMethod) => {
  const customerId = typeof pm.customer === 'string' ? pm.customer : pm.customer?.id ?? null
  if (!customerId) {
    // FIXME: This should probably return something or not at all or maybe in the upsert method?
    throw new Error('PaymentMethod has no customer attached.')
  }

  return {
    id: pm.id,
    customerId,
    type: pm.type,
    last4: pm.card?.last4,
    brand: pm.card?.brand,
    mobilePay: pm.mobilepay,
    createdAt: fromUnixTime(pm.created),
  }
}
