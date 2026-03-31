import { authorize } from 'nuxt-authorization/utils'
import { db } from '@nuxthub/db'
import { canViewAllExpenses } from '#shared/abilities/expenses'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  await authorize(canViewAllExpenses, user)

  const allExpenses = await db.query.expenses.findMany({
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: (expenses, { desc }) => [desc(expenses.createdAt)],
  })

  return allExpenses
})
