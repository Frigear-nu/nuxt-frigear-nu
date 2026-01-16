import { useServerStripe } from '#stripe/server'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event)
  const webhookSecret = runtimeConfig.stripeWebhookSecret || undefined

  if (!webhookSecret) {
    throw createError({ statusCode: 400, message: 'Missing webhook secret.' })
  }

  const signature = event.headers.get('stripe-signature')
  if (!signature) {
    throw createError({ statusCode: 400, message: 'Missing signature.' })
  }

  const rawBody = await readRawBody(event)
  if (!rawBody) {
    throw createError({ statusCode: 400, message: 'Missing body.' })
  }

  let stripeEvent
  const stripe = useServerStripe(event)
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    )
  }
  catch (err: unknown) {
    throw createError({ statusCode: 400, message: 'Invalid signature.', cause: err })
  }

  if (!stripeEvent) {
    throw createError({ statusCode: 400, message: 'Invalid stripe event.' })
  }

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
