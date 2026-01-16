import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import type { z } from 'zod'

export const users = sqliteTable('users', {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
  passwordHash: text(),
  avatarUrl: text(),

  // For migration from supabase (will be removed in the future)
  isMigrated: integer('is_migrated', { mode: 'boolean' }).notNull().default(false),
  supabaseId: text('supabase_id'),

  //
  lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
  emailVerifiedAt: integer('email_verified_at', { mode: 'timestamp' }),
  createdAt: integer({ mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export type Users = typeof users.$inferSelect
export type NewUsers = typeof users.$inferInsert

export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer().notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer({ mode: 'timestamp' }).notNull(),
})

export type Sessions = typeof sessions.$inferSelect
export type NewSessions = typeof sessions.$inferInsert

export const magicLinks = sqliteTable('magic_links', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer().notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text().notNull().unique(),
  expiresAt: integer({ mode: 'timestamp' }).notNull(),
  usedAt: integer('used_at', { mode: 'timestamp' }),
})

export type MagicLinks = typeof magicLinks.$inferSelect
export type NewMagicLinks = typeof magicLinks.$inferInsert

export const passwordResets = sqliteTable('password_resets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer().notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text().notNull().unique(),
  expiresAt: integer({ mode: 'timestamp' }).notNull(),
  usedAt: integer('used_at', { mode: 'timestamp' }),
})

export type PasswordResets = typeof passwordResets.$inferSelect
export type NewPasswordResets = typeof passwordResets.$inferInsert

export const oauthApps = sqliteTable('oauth_apps', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer().notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: text().notNull(),
  providerAccountId: text().notNull(),
  accessToken: text().notNull(),
  refreshToken: text(),
  expiresAt: integer({ mode: 'timestamp' }),
  createdAt: integer({ mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer({ mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export type OauthApps = typeof oauthApps.$inferSelect
export type NewOauthApps = typeof oauthApps.$inferInsert

export const passkeys = sqliteTable('passkeys', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  credentialId: text('credential_id').notNull(), // base64url encoded
  publicKey: text('public_key').notNull(),
  signCount: integer('sign_count').default(0),
  createdAt: integer('created_at').notNull(),
  lastUsedAt: integer('last_used_at'),
})

export type Passkeys = z.infer<typeof passkeys>
export type NewPasskeys = z.infer<typeof passkeys>

// todo: in the future build sessions table for revocable JWT's
