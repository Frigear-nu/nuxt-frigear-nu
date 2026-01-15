import * as stripe from './stripe'
import * as user from './user'

import { relations } from 'drizzle-orm'

export const usersRelations = relations(user.users, ({ many }) => ({
  stripeCustomers: many(stripe.stripeCustomers),
}))

export const stripeUsersRelations = relations(stripe.stripeCustomers, ({ one, many }) => ({
  user: one(user.users, {
    fields: [stripe.stripeCustomers.userId],
    references: [user.users.id],
  }),
  subscriptions: many(stripe.stripeSubscriptions),
}))

export const stripeSubscriptionsRelations = relations(stripe.stripeSubscriptions, ({ one }) => ({
  customer: one(stripe.stripeCustomers, {
    fields: [stripe.stripeSubscriptions.userId],
    references: [stripe.stripeCustomers.id],
  }),
}))
