import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)

  const stripe = useTaskStripe()
  const [stripeCustomer] = await db.query.stripeCustomers.findMany({
    where: () => eq(schema.stripeCustomers.userId, userId),
  })

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomer.id,
    return_url: withBaseUrl('/account/membership'),
  })

  return { url: session.url }
})
