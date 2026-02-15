import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { users } from './user'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

const createDomainId = (prefix?: string) => `${prefix || ''}${createId()}`

export const events = sqliteTable('events', {
  id: text().primaryKey().notNull().$defaultFn(() => createDomainId('event_')),
  createdBy: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

  // Overview
  slug: text('slug').notNull().unique(),
  // Maybe consolidate the titles to be an object?
  title: text('title').notNull(), // default (da/en?)
  titleI18n: text('title_i18n', { mode: 'json' }).$type<{ [locale: string]: string }>(),
  // Maybe consolidate the descriptions to be an object?
  description: text('description'), // default (da/en?)
  // {da: 'text'}
  descriptionI18n: text('description_i18n', { mode: 'json' }).$type<{ [locale: string]: string }>(),

  // Media
  coverPath: text(),
  coverSize: integer(),
  // TODO: Naming?
  ticketStripeProductId: text(),
  // kinda
  eventProductStripeProductId: text('event_stripe_product_id'),

  // ACL
  requireStripePrice: text({ mode: 'json' }).$type<('*' | string)[]>(),

  // Timestamps
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdateFn(() => new Date()),
})

export const eventsRelations = relations(events, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [events.createdBy],
    references: [users.id],
  }),
  tickets: many(eventTickets),
  products: many(eventProducts),
  attendees: many(eventAttendees),
}))

export const eventTickets = sqliteTable('event_tickets', {
  id: text().primaryKey().notNull().$defaultFn(() => createDomainId('ticket_')),
  eventId: text('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  price: integer('price').notNull(),
  currency: text('currency').notNull(),
  stripePriceId: text('stripe_price_id').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const eventTicketsRelations = relations(eventTickets, ({ one }) => ({
  event: one(events, {
    fields: [eventTickets.eventId],
    references: [events.id],
  }),
}))

export const eventProducts = sqliteTable('event_products', {
  id: text().primaryKey().notNull().$defaultFn(() => createDomainId('eventproduct_')),
  eventId: text('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  // TODO: i18n like the event?
  price: integer('price').notNull(),
  currency: text('currency').notNull(),
  // this might be null if it is free f.ex?
  stripePriceId: text('stripe_price_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const eventProductsRelations = relations(eventProducts, ({ one }) => ({
  event: one(events, {
    fields: [eventProducts.eventId],
    references: [events.id],
  }),
}))

// TODO: Naming?
export const eventAttendees = sqliteTable('event_attendees', {
  id: text().primaryKey().notNull().$defaultFn(() => createDomainId('attendee_')),
  eventId: text('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  // sometimes there is no ticket?
  ticketId: text('ticket_id').references(() => eventTickets.id, { onDelete: 'set null' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  productIds: text('product_ids', { mode: 'json' }).$type<string[]>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  // rsvp: text({ enum: ['going', 'maybe'] }), // Could be useful in the future, idk.
})

export const eventAttendeesRelations = relations(eventAttendees, ({ one }) => ({
  event: one(events, {
    fields: [eventAttendees.eventId],
    references: [events.id],
  }),
  ticket: one(eventTickets, {
    fields: [eventAttendees.ticketId],
    references: [eventTickets.id],
  }),
  user: one(users, {
    fields: [eventAttendees.userId],
    references: [users.id],
  }),
}))
