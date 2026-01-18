import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { users } from './user'

export const stripeProducts = sqliteTable('stripe_products', {
  id: text().primaryKey(),
  active: integer({ mode: 'boolean' }).notNull(),
  name: text().notNull(),
  description: text(),
  image: text(),
  metadata: text(),
  taxCodeId: text('tax_code_id'),
})

export type StripeProducts = typeof stripeProducts.$inferSelect
export type NewStripeProducts = typeof stripeProducts.$inferInsert

export const stripePrices = sqliteTable('stripe_prices', {
  id: text().primaryKey(),
  productId: text('product_id').notNull().references(() => stripeProducts.id),
  active: integer({ mode: 'boolean' }).notNull(),
  description: text(),
  unitAmount: integer('unit_amount').notNull(),
  currency: text().notNull(),
  type: text('type').notNull(),
  interval: text('interval').notNull(),
  intervalCount: integer('interval_count').notNull(),
  trialPeriodDays: integer('trial_period_days').notNull(),
  metadata: text({ mode: 'json' }),
})

export type StripePrices = typeof stripePrices.$inferInsert
export type NewStripePrices = typeof stripePrices.$inferInsert

export const stripeSubscriptions = sqliteTable('stripe_subscriptions', {
  id: text().primaryKey(),
  userId: text('user_id').notNull().references(() => stripeCustomers.id),
  status: text().notNull(),
  metadata: text().notNull(),
  priceId: text('price_id').notNull().references(() => stripePrices.id),
  quantity: integer().notNull().default(1),
  cancelAtPeriodEnd: integer('cancel_at_period_end', { mode: 'boolean' }).notNull(),
  created: integer({ mode: 'timestamp' }).notNull(),
  currentPeriodStart: integer('current_period_start', { mode: 'timestamp' }).notNull(),
  currentPeriodEnd: integer('current_period_end', { mode: 'timestamp' }).notNull(),
  endedAt: integer('ended_at', { mode: 'timestamp' }),
})

export type StripeSubscriptions = typeof stripeSubscriptions.$inferInsert
export type NewStripeSubscriptions = typeof stripeSubscriptions.$inferInsert

export const stripeCustomers = sqliteTable('stripe_customers', {
  id: text().primaryKey(),
  userId: integer().references(() => users.id),
}, (t) => {
  return {
    unique: uniqueIndex('unique_idx').on(t.id, t.userId),
  }
})

export type StripeCustomers = typeof stripeCustomers.$inferInsert
export type NewStripeCustomers = typeof stripeCustomers.$inferInsert
