import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { users } from './user'
import { relations } from 'drizzle-orm'
import type Stripe from 'stripe'

export const stripeProducts = sqliteTable('stripe_products', {
  id: text().primaryKey(),
  active: integer({ mode: 'boolean' }).notNull(),
  name: text().notNull(),
  description: text(),
  images: text('image', { mode: 'json' }).$type<string[]>(),
  metadata: text({ mode: 'json' }),
  taxCodeId: text('tax_code_id'),
})

export type StripeProducts = typeof stripeProducts.$inferSelect
export type NewStripeProducts = typeof stripeProducts.$inferInsert

// Stripe relations
export const stripeProductsRelations = relations(stripeProducts, ({ many }) => ({
  prices: many(stripePrices),
}))

export const stripePrices = sqliteTable('stripe_prices', {
  id: text().primaryKey(),
  productId: text('product_id').references(() => stripeProducts.id, {
    onDelete: 'cascade',
  }),
  active: integer({ mode: 'boolean' }).notNull(),
  description: text(),
  unitAmount: integer('unit_amount').notNull(),
  currency: text().notNull(),
  type: text('type').notNull(),
  interval: text('interval').notNull(),
  intervalCount: integer('interval_count').notNull(),
  trialPeriodDays: integer('trial_period_days').notNull(),
  lookupKey: text('lookup_key'),
  images: text({ mode: 'json' }).$type<string[]>(),
  metadata: text({ mode: 'json' }).$type<{ title?: string, title_en?: string, description?: string, description_en?: string, [key: string]: string | undefined }>(),
})

export type StripePrices = typeof stripePrices.$inferSelect
export type NewStripePrices = typeof stripePrices.$inferInsert

export const stripePricesRelations = relations(stripePrices, ({ one, many }) => ({
  product: one(stripeProducts, {
    fields: [stripePrices.productId],
    references: [stripeProducts.id],
  }),
  subscriptions: many(stripeSubscriptions),
}))

export const stripeSubscriptions = sqliteTable('stripe_subscriptions', {
  id: text().primaryKey(),
  customerId: text('customer_id').references(() => stripeCustomers.id, {
    onDelete: 'cascade',
  }),
  status: text().notNull(),
  metadata: text({ mode: 'json' }).notNull(),
  priceId: text('price_id').references(() => stripePrices.id, {
    onDelete: 'cascade',
  }),
  items: text('items', { mode: 'json' }),
  quantity: integer().notNull().default(1),
  cancelAtPeriodEnd: integer('cancel_at_period_end', { mode: 'boolean' }).notNull(),
  cancelAt: integer('cancel_at', { mode: 'timestamp' }),
  cancellationDetails: text('cancellation_details', { mode: 'json' }).$type<Stripe.Subscription.CancellationDetails>(),
  created: integer({ mode: 'timestamp' }).notNull(),
  currentPeriodStart: integer('current_period_start', { mode: 'timestamp' }).notNull(),
  currentPeriodEnd: integer('current_period_end', { mode: 'timestamp' }).notNull(),
  endedAt: integer('ended_at', { mode: 'timestamp' }),
})

export type StripeSubscriptions = typeof stripeSubscriptions.$inferSelect
export type NewStripeSubscriptions = typeof stripeSubscriptions.$inferInsert

export const stripeSubscriptionsRelations = relations(stripeSubscriptions, ({ one }) => ({
  customer: one(stripeCustomers, {
    fields: [stripeSubscriptions.customerId],
    references: [stripeCustomers.id],
  }),
  price: one(stripePrices, {
    fields: [stripeSubscriptions.priceId],
    references: [stripePrices.id],
  }),
}))

export const stripePaymentMethods = sqliteTable('stripe_payment_methods', {
  id: text().primaryKey(),
  customerId: text('customer_id').references(() => stripeCustomers.id, {
    onDelete: 'cascade',
  }),
  type: text('type').notNull(),
  metadata: text({ mode: 'json' }).notNull(),
  card: text('card', { mode: 'json' }).$type<{ brand: string, last4: string, exp_month: number, exp_year: number }>(),
})

export const stripePaymentMethodsRelations = relations(stripePaymentMethods, ({ one }) => ({
  customer: one(stripeCustomers, {
    fields: [stripePaymentMethods.customerId],
    references: [stripeCustomers.id],
  }),
}))

export const stripeCustomers = sqliteTable('stripe_customers', {
  id: text().primaryKey(),
  userId: integer().references(() => users.id, {
    onDelete: 'cascade',
  }),
}, (t) => {
  return {
    unique: uniqueIndex('unique_idx').on(t.id, t.userId),
  }
})

export type StripeCustomers = typeof stripeCustomers.$inferSelect
export type NewStripeCustomers = typeof stripeCustomers.$inferInsert

export const stripeCustomersRelations = relations(stripeCustomers, ({ one, many }) => ({
  user: one(users, {
    fields: [stripeCustomers.userId],
    references: [users.id],
  }),
  subscriptions: many(stripeSubscriptions),
  paymentMethods: many(stripePaymentMethods),
}))
