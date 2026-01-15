import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
  password: text(),
  avatar: text(),
  createdAt: integer({ mode: 'timestamp' }).$defaultFn(() => new Date()),
  lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
  // For migration from supabase
  isMigrated: integer('is_migrated', { mode: 'boolean' }).notNull().default(false),
})

export type Users = typeof users.$inferSelect
export type NewUsers = typeof users.$inferInsert
