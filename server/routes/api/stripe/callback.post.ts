import { useServerStripe } from '#stripe/server'
import { consumeStripeWebhook } from '#server/services/stripe-webhooks'

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

  if (import.meta.dev) console.log('Stripe webhook received:', stripeEvent.type)

  return consumeStripeWebhook(event, stripeEvent)
})
