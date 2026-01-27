import type { NewStripePrices, NewStripeProducts, NewStripeSubscriptions } from 'hub:db:schema'
import { eq } from 'drizzle-orm'
import type Stripe from 'stripe'
import type { H3Event } from 'h3'
import { fromUnixTime } from 'date-fns'
import { useServerStripe } from '#stripe/server'

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
    // case 'plan.created':
    // case 'plan.updated':
    // case 'plan.deleted':
    //   console.log(stripeEvent.data.object)
    //   throw new Error('Plan events are not supported yet.')
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
      // FIXME: Might want to silently drop this
      throw createError({ status: 200, message: 'Event not handled yet.' })

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
    image: p.images?.[0] ?? null,
    metadata: p.metadata,
    taxCodeId: typeof p.tax_code === 'string'
      ? p.tax_code
      : p.tax_code?.id ?? null,
  }
}

export const upsertStripeProduct = async (
  stripeProduct: Stripe.Product,
) => {
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

export const transformStripePrice = (p: Stripe.Price): NewStripePrices => {
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
    description: p.nickname,
    type: p.type,
    // FIXME: This might be empty?
    interval: r ? r.interval : 'week',
    intervalCount: r ? r.interval_count : 0,
    trialPeriodDays: r ? r.trial_period_days ?? 0 : 0,
    metadata: p.metadata,
  }
}

export const upsertStripePrice = async (stripe: Stripe, price: Stripe.Price) => {
  // this might be redundant since we do not rely on the FK for the objects.
  // FIXME: Remove if not required.
  if (price.product) {
    if (typeof price.product === 'object') {
      if (price.product.deleted) {
        throw new Error('Cannot upsert price for deleted product.')
      }
      await upsertStripeProduct(price.product)
    }
    else {
      const { data: products } = await stripe.products.list({
        ids: [price.product],
      })

      if (products && products[0]) {
        await upsertStripeProduct(products[0])
      }
    }
  }

  //
  const { id, ...remaining } = transformStripePrice(price)

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

  if (items.length !== 1) {
    throw new Error('Subscription has too many/few items attached, expected 1.')
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
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    created: fromUnixTime(sub.created),
    currentPeriodStart: fromUnixTime(item.current_period_start),
    currentPeriodEnd: fromUnixTime(item.current_period_end),
  }
}

export const upsertStripeCustomerSubscription = async (
  subscription: Stripe.Subscription,
) => {
  const { id, ...remaining } = transformStripeSubscription(subscription)

  await db
    .insert(schema.stripeSubscriptions)
    .values({ id, ...remaining })
    .onConflictDoUpdate({
      target: schema.stripeSubscriptions.id,
      set: remaining,
    })
}
