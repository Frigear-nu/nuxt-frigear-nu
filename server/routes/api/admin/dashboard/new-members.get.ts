import { db, schema } from '@nuxthub/db'
import { authorize } from 'nuxt-authorization/utils'
import { canViewUsers } from '#shared/abilities/admin'
import { desc, eq, gte, sql } from 'drizzle-orm'
import { subDays } from 'date-fns'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  await authorize(canViewUsers, user)

  return db.select({
    id: schema.users.id,
    name: schema.users.name,
    email: schema.users.email,
    interval: schema.stripePrices.interval,
    subscription: sql<string>`COALESCE(
      json_extract(${schema.stripeProducts.metadata}, '$.title_en'),
    ${schema.stripeProducts.name}
    )`,
    price: schema.stripePrices.unitAmount,
    signedUpAt: schema.users.createdAt,
    user: schema.users,
  }).from(schema.users)
    .orderBy(desc(schema.users.createdAt))
    .where(gte(schema.users.createdAt, subDays(new Date(), 30)))
    .limit(20)
    .leftJoin(schema.stripeCustomers, eq(schema.stripeCustomers.userId, schema.users.id))
    .leftJoin(schema.stripeSubscriptions, eq(schema.stripeSubscriptions.customerId, schema.stripeCustomers.id))
    .leftJoin(schema.stripePrices, eq(schema.stripePrices.id, schema.stripeSubscriptions.priceId))
    .leftJoin(schema.stripeProducts, eq(schema.stripeProducts.id, schema.stripePrices.productId))
})
