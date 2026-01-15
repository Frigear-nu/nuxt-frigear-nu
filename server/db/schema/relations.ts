import * as stripe from './stripe'
import * as user from './user'

import { relations } from 'drizzle-orm'

export const usersRelations = relations(user.users, ({ many }) => ({
  stripeAccounts: many(user.stripeUsers),
}))

export const scripeUsersRelations = relations(user.stripeUsers, ({ one }) => ({
  user: one(user.users, {
    fields: [user.stripeUsers.userId],
    references: [user.users.id],
  }),

}))
