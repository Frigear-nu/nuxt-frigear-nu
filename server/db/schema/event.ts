import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { users } from './user'
import { createId } from '@paralleldrive/cuid2'

const createDomainId = (prefix?: string) => `${prefix || ''}${createId()}`

// Since we load event using nuxt content collections, we only need the wiring for user-ticket

export const userEventTickets = sqliteTable('user_event_tickets', {
  id: text('id').primaryKey().$defaultFn(() => createDomainId('ticket_')),
  eventPath: text('event_path').notNull(),
  userId: integer('user_id').notNull().references(() => users.id),
  checkoutSessionId: text('checkout_session_id'),
  ticketKey: text('ticket_key').notNull(), // references the object key of the ticket -> allows swapping in the future.
  // TODO: Since we store the event and ticketing in content/events/
  //  we cannot change the stripeId stuff once a ticket had any sales,
  //  so we store it here to be sure it does not disappear.
  stripeId: text('stripe_id'), // product id for the ticket (can be NULL if it is a free ticket)
  priceIds: text('price_ids', { mode: 'json' }).$type<string[]>(), // Any and all prices included in the charge.
  // productPriceMapping: text('product_price_mapping', { mode: 'json' }).$type<Record<string, string>>(),
  status: text('status', { enum: ['pending', 'paid', 'abandoned', 'cancelled'] }).notNull().default('pending'),
  paidAt: integer('paid_at', { mode: 'timestamp' }),
  abandonedAt: integer('abandoned_at', { mode: 'timestamp' }),
  cancelledAt: integer('cancelled_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdateFn(() => new Date()),
})

export const userEventTicketsRelations = relations(userEventTickets, ({ one }) => ({
  user: one(users, {
    fields: [userEventTickets.userId],
    references: [users.id],
  }),
}))
