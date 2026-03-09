import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import { useValidatedBody } from 'h3-zod'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)

  const { priceId, paymentMethodId } = await useValidatedBody(event, z.object({
    priceId: z.string(),
    paymentMethodId: z.string().optional(),
  }))

  const stripe = useTaskStripe()

  const priceWithProduct = await db.query.stripePrices.findFirst({
    where: () => eq(schema.stripePrices.id, priceId),
    with: {
      product: true,
    },
  })

  if (!priceWithProduct) throw new Error(
    `Could not find stripe price with id ${priceId}`,
  )

  const stripeCustomers = await db.query.stripeCustomers.findMany({
    where: () => eq(schema.stripeCustomers.userId, userId),
    with: {
      subscriptions: true,
      paymentMethods: {
        where: paymentMethodId
          ? () => eq(schema.stripePaymentMethods.id, paymentMethodId)
          : undefined,
      },
    },
  })

  if (!stripeCustomers || !stripeCustomers[0]) throw new Error('No customer')
  const hasActiveSubscription = stripeCustomers.some(({ subscriptions }) => subscriptions.some(({ status }) => status === 'active'))
  const [activeSubscription] = stripeCustomers.flatMap(({ subscriptions }) => subscriptions.filter(({ status }) => status === 'active'))

  if (hasActiveSubscription && activeSubscription) {
    const stripeSubscription = await stripe.subscriptions.retrieve(activeSubscription.id)
    const [subscriptionItem] = stripeSubscription.items.data

    const newSubscriptionPrice = typeof subscriptionItem?.price === 'object' ? subscriptionItem.price?.unit_amount || 0 : 0
    const isUpgrade = priceWithProduct.unitAmount > newSubscriptionPrice

    // since it is an upgrade, we want to:
    // 1. Forward any unspent "balance" / "time" to the new subscription
    // 2. Invoice for the remaining amount immediately
    if (isUpgrade) {
      const updated = await stripe.subscriptions.update(activeSubscription.id, {
        items: [{ price: priceWithProduct.id, id: subscriptionItem?.id || undefined }].filter(Boolean) as [{ id?: string, price?: string }],
        proration_behavior: 'always_invoice',
      })

      if (!updated) {
        throw new Error('unknown payment error')
      }

      return { updated: true }
    }

    // since this is a downgrade, we want to:
    // 1. move to the new subscription at the end of the cycle
    // 2. invoice for the remaining amount at the end of the cycle
    const existingSchedules = await stripe.subscriptionSchedules.list({ customer: stripeSubscription.customer as string })
    const existingSchedule = existingSchedules.data.find(s => s.subscription === activeSubscription.id)
    const schedule = existingSchedule
      ?? await stripe.subscriptionSchedules.create({ from_subscription: activeSubscription.id })

    await stripe.subscriptionSchedules.update(schedule.id, {
      end_behavior: 'release',
      phases: [
        {
          items: [{
            price: schedule.phases[0]?.items[0]?.price as string,
            quantity: schedule.phases[0]?.items[0]?.quantity,
          }],
          start_date: schedule.phases[0]?.start_date,
          end_date: schedule.phases[0]?.end_date,
        },
        {
          items: [{ price: priceWithProduct.id, quantity: 1 }],
        },
      ],
    })

    return { updated: true }
  }

  // Send to stripe
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: stripeCustomers[0]?.id,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: withBaseUrl('/payment/success'),
    cancel_url: withBaseUrl('/payment/cancel'),
  })

  if (!checkoutSession) throw new Error(
    'Could not create checkout session',
  )

  return { url: checkoutSession.url }
})
