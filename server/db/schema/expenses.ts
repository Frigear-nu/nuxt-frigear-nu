import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { users } from './user'

const createDomainId = (prefix?: string) => `${prefix || ''}${createId()}`

export const expenses = sqliteTable('expenses', {
  id: text('id').primaryKey().$defaultFn(() => createDomainId('exp_')),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  amount: real('amount').notNull(),
  description: text('description'),
  attachments: text('attachments', { mode: 'json' }).notNull().$type<string[]>().$defaultFn(() => []),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdateFn(() => new Date()),
})

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
}))

export type Expense = typeof expenses.$inferSelect
export type ExpenseInsert = typeof expenses.$inferInsert
