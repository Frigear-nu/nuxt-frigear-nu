import { sqliteTable, text, integer /* uniqueIndex */ } from 'drizzle-orm/sqlite-core'

export const stripeProducts = sqliteTable('stripe_products', {
  id: text().primaryKey(),
  active: integer({ mode: 'boolean' }).notNull(),
  name: text().notNull(),
  description: text(),
  image: text(),
  metadata: text(),
  taxCodeId: text('tax_code_id'),
})

export const stripePrices = sqliteTable('stripe_prices', {
  id: text().primaryKey(),
  productId: text('product_id').notNull(),
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

export const stripeSubscriptions = sqliteTable('stripe_subscriptions', {
  id: text().primaryKey(),
  // userId: text('user_id').notNull(),
  status: text().notNull(),
  metadata: text().notNull(),
  priceId: text('price_id').notNull(),
  quantity: integer().notNull(),
  cancelAtPeriodEnd: integer('cancel_at_period_end', { mode: 'boolean' }).notNull(),
  created: integer({ mode: 'timestamp' }).notNull(),
  currentPeriodStart: integer('current_period_start', { mode: 'timestamp' }).notNull(),
  currentPeriodEnd: integer('current_period_end', { mode: 'timestamp' }).notNull(),
  endedAt: integer('ended_at', { mode: 'timestamp' }),
})

// // create table public.customers (
// //   id uuid not null,
// //   stripe_customer_id text null,
// //   constraint customers_pkey primary key (id),
// //   constraint customers_id_fkey foreign KEY (id) references auth.users (id)
// // ) TABLESPACE pg_default;
// export const stripeUsers = sqliteTable('stripe_customers', {
//   userId: integer().primaryKey(),
//   stripeCustomerId: text('stripe_customer_id'),
// }, (t) => {
//   return {
//     unique: uniqueIndex('unique_idx').on(t.stripeCustomerId, t.userId),
//   }
// })

// Users table
// export const users = sqliteTable('users', {
//   id: integer().primaryKey({ autoIncrement: true }),
//   name: text().notNull(),
//   email: text().notNull().unique(),
//   password: text().notNull(),
//   avatar: text().notNull(),
//   createdAt: integer({ mode: 'timestamp' }).notNull(),
// })
//

export type StripeProducts = typeof stripeProducts.$inferSelect
export type StripePrices = typeof stripePrices.$inferInsert
export type StripeSubscriptions = typeof stripeSubscriptions.$inferInsert
