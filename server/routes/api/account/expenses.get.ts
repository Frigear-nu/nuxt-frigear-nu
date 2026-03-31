import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import { requireUserId } from '#server/utils/auth'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)

  const userExpenses = await db.query.expenses.findMany({
    where: () => eq(schema.expenses.userId, userId),
    orderBy: (expenses, { desc }) => [desc(expenses.createdAt)],
  })

  return userExpenses
})
