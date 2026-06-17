import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { stripeCustomers } from './stripe'
import { userEventTickets } from './event'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').unique(),
  role: text('role', { enum: [
    'admin',
    'manager',
    'coordinator',
    'eventmanager',
    'barmanager',
    'crew',
    'member',
    'supplier',
    'partner',
    'user',
  ] }).notNull().default('user'),
  passwordHash: text('password_hash'),
  avatarUrl: text('avatar_url'),

  roskildePeopleId: integer('roskilde_people_id').unique(),
  // For migration from supabase (will be removed in the future)
  isMigrated: integer('is_migrated', { mode: 'boolean' }).notNull().default(false),
  supabaseId: text('supabase_id'),
  supabaseProvider: text('supabase_provider'),

  //
  lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
  emailVerifiedAt: integer('email_verified_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  accessTags: text('accessTags', { mode: 'json' }).$type<string[]>().default([]),
})

export type Users = typeof users.$inferSelect
export type NewUsers = typeof users.$inferInsert

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  stripeCustomers: many(stripeCustomers),
  magicLinks: many(magicLinks),
  passwordResets: many(passwordResets),
  oauthApps: many(oauthApps),
  passkeys: many(passkeys),
  tickets: many(userEventTickets),
  roskildeWristbands: many(userRoskildeWristband, { relationName: 'roskilde_wristband_user' }),
  createdRoskildeWristbands: many(userRoskildeWristband, { relationName: 'roskilde_wristband_addedBy' }),
}))

export const userRoskildeWristband = sqliteTable('user_roskilde_wristband', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  addedBy: integer('added_by').references(() => users.id, { onDelete: 'set null' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  year: integer().$defaultFn(() => (new Date()).getFullYear()),
  bandId: text('band_id'),
  bandSerial: text('band_serial'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdateFn(() => new Date()),
}, t => [
  uniqueIndex('urwidx').on(t.userId, t.year),
  uniqueIndex('urwbidx').on(t.bandId),
  uniqueIndex('urwbsidx').on(t.bandSerial),
])

export const userRoskildeIdRelations = relations(userRoskildeWristband, ({ one }) => ({
  user: one(users, {
    relationName: 'roskilde_wristband_user',
    fields: [userRoskildeWristband.userId],
    references: [users.id],
  }),
  addedBy: one(users, {
    relationName: 'roskilde_wristband_addedBy',
    fields: [userRoskildeWristband.addedBy],
    references: [users.id],
  }),
}))

export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
})

export type Sessions = typeof sessions.$inferSelect
export type NewSessions = typeof sessions.$inferInsert

export const magicLinks = sqliteTable('magic_links', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  code: text().notNull().unique(),
  redirectUrl: text('redirect_url'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  usedAt: integer('used_at', { mode: 'timestamp' }),
})

export type MagicLinks = typeof magicLinks.$inferSelect
export type NewMagicLinks = typeof magicLinks.$inferInsert

export const magicLinksRelations = relations(magicLinks, ({ one }) => ({
  user: one(users, {
    fields: [magicLinks.userId],
    references: [users.id],
  }),
}))

export const passwordResets = sqliteTable('password_resets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  code: text().notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  usedAt: integer('used_at', { mode: 'timestamp' }),
})

export type PasswordResets = typeof passwordResets.$inferSelect
export type NewPasswordResets = typeof passwordResets.$inferInsert

export const passwordResetsRelations = relations(passwordResets, ({ one }) => ({
  user: one(users, {
    fields: [passwordResets.userId],
    references: [users.id],
  }),
}))

export const oauthApps = sqliteTable('oauth_apps', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: text().notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export type OauthApps = typeof oauthApps.$inferSelect
export type NewOauthApps = typeof oauthApps.$inferInsert

export const oauthAppsRelations = relations(oauthApps, ({ one }) => ({
  user: one(users, {
    fields: [oauthApps.userId],
    references: [users.id],
  }),
}))

export const passkeys = sqliteTable('passkeys', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  credentialId: text('credential_id').notNull(), // base64url encoded
  publicKey: text('public_key').notNull(),
  signCount: integer('sign_count').default(0),
  createdAt: integer('created_at').notNull(),
  lastUsedAt: integer('last_used_at'),
})

export type Passkeys = typeof passkeys.$inferSelect
export type NewPasskeys = typeof passkeys.$inferInsert

export const passkeysRelations = relations(passkeys, ({ one }) => ({
  user: one(users, {
    fields: [passkeys.userId],
    references: [users.id],
  }),
}))
