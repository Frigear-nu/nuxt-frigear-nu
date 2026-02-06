import { eq } from 'drizzle-orm'
import { useValidatedBody } from 'h3-zod'
import { z } from 'zod'

// TODO: This will eventually be used to create a session with stripe to store the payment method.
export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)

  const { locale } = await useValidatedBody(event, z.object({
    locale: z.string().optional(),
  }))

  const [stripeCustomer] = await db.query.stripeCustomers.findMany({
    where: () => eq(schema.stripeCustomers.userId, userId),
  })

  let redirectPath = '/account/membership'
  if (locale && isSupportedLocale(event, locale) && !isDefaultLocale(event, locale)) {
    redirectPath = `/${locale}${redirectPath}`
  }

  const stripe = useTaskStripe()
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomer.id,
    return_url: withBaseUrl(redirectPath),
    locale: locale as never,
  })

  return { url: session.url }
})
