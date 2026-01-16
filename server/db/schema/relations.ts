import { relations } from 'drizzle-orm'
import * as stripe from './stripe'
import * as user from './user'

// User relations
export const usersRelations = relations(user.users, ({ many }) => ({
  stripeCustomers: many(stripe.stripeCustomers),
  magicLinks: many(user.magicLinks),
  passwordResets: many(user.passwordResets),
  oauthApps: many(user.oauthApps),
  passkeys: many(user.passkeys),
}))

export const magicLinksRelations = relations(user.magicLinks, ({ one }) => ({
  user: one(user.users, {
    fields: [user.magicLinks.userId],
    references: [user.users.id],
  }),
}))

export const passwordResetsRelations = relations(user.passwordResets, ({ one }) => ({
  user: one(user.users, {
    fields: [user.passwordResets.userId],
    references: [user.users.id],
  }),
}))

export const oauthAppsRelations = relations(user.oauthApps, ({ one }) => ({
  user: one(user.users, {
    fields: [user.oauthApps.userId],
    references: [user.users.id],
  }),
}))

export const passkeysRelations = relations(user.passkeys, ({ one }) => ({
  user: one(user.users, {
    fields: [user.passkeys.userId],
    references: [user.users.id],
  }),
}))

// Stripe relations
export const stripeProductsRelations = relations(stripe.stripeProducts, ({ many }) => ({
  prices: many(stripe.stripePrices),
}))

export const stripePricesRelations = relations(stripe.stripePrices, ({ one, many }) => ({
  product: one(stripe.stripeProducts, {
    fields: [stripe.stripePrices.productId],
    references: [stripe.stripeProducts.id],
  }),
  subscriptions: many(stripe.stripeSubscriptions),
}))

export const stripeSubscriptionsRelations = relations(stripe.stripeSubscriptions, ({ one }) => ({
  customer: one(stripe.stripeCustomers, {
    fields: [stripe.stripeSubscriptions.userId],
    references: [stripe.stripeCustomers.id],
  }),
  price: one(stripe.stripePrices, {
    fields: [stripe.stripeSubscriptions.priceId],
    references: [stripe.stripePrices.id],
  }),
}))

export const stripeCustomersRelations = relations(stripe.stripeCustomers, ({ one, many }) => ({
  user: one(user.users, {
    fields: [stripe.stripeCustomers.userId],
    references: [user.users.id],
  }),
  subscriptions: many(stripe.stripeSubscriptions),
}))
