import { useServerStripe } from '#stripe/server'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event)
  const webhookSecret = runtimeConfig.stripeWebhookSecret || undefined
  const signature = event.headers.get('stripe-signature')

  if (!webhookSecret || !signature) {
    throw createError({ statusCode: 400, message: 'Missing webhook secret or signature' })
  }

  const stripe = useServerStripe(event)

  const rawBody = await readRawBody(event)
  if (!rawBody) {
    throw createError({ statusCode: 400, message: 'Missing body.' })
  }

  const eventNotification = stripe.parseEventNotification(rawBody, signature, webhookSecret)
  const stripeEvent = await stripe.events.retrieve(eventNotification.id)

  switch (stripeEvent.type) {
    // Todo: Handle the events listed
    case 'product.created':
    case 'product.updated':
    case 'product.deleted':
    case 'price.created':
    case 'price.updated':
    case 'price.deleted':
    case 'customer.created':
    case 'customer.updated':
    case 'customer.deleted':
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.paused':
    case 'customer.subscription.deleted':
      throw createError({ statusCode: 400, message: 'Event not handled yet.' })

    default:
      return { statusCode: 200 }
  }
})
