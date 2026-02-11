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

    const updated = await stripe.subscriptions.update(activeSubscription.id, {
      items: [{ price: priceWithProduct.id, id: subscriptionItem?.id || undefined },
      ].filter(Boolean) as [{ id?: string, price?: string }],
    })

    if (!updated) {
      throw new Error('unknown payment error')
    }

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
