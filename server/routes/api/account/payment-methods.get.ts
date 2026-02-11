import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)

  const stripeCustomers = await db.query.stripeCustomers.findMany({
    where: () => eq(schema.stripeCustomers.userId, userId),
    with: {
      paymentMethods: true,
    },
  })

  return stripeCustomers.flatMap(({ paymentMethods }) => paymentMethods)
})
