import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)

  const stripeCustomersWithSubs = await db.query.stripeCustomers.findMany({
    where: () => eq(schema.stripeCustomers.userId, userId),
    with: {
      subscriptions: {
        with: {
          // TODO: This results in minimum 2 reads in D1 land if there is a subscription+price,
          //   should probably be reduced to a single?
          //     - will require a smaller rewrite of the stripeSubscriptions table to include details
          price: true,
        },
      },
    },
  })

  // we do not want to return two arrays; it will be a very odd case where a user actually has
  // multiple stripe customers attached, therefore, we flatten it.
  return stripeCustomersWithSubs.flatMap(({ subscriptions }) => {
    return subscriptions.map(({ id, customerId, ...subscription }) => ({
      id,
      customerId,
      userId,
      ...subscription,
    }))
  })
})
