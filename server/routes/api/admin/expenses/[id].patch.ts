import { authorize } from 'nuxt-authorization/utils'
import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import { NotFoundError } from '@nitrotool/errors'
import { canApproveExpense } from '#shared/abilities/expenses'
import { updateExpenseStatusSchema } from '#shared/schema/expenses'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  await authorize(canApproveExpense, user)

  const id = getRouterParam(event, 'id')

  const { status } = await readValidatedBody(event, updateExpenseStatusSchema.parse)

  const [updated] = await db
    .update(schema.expenses)
    .set({ status, updatedAt: new Date() })
    .where(eq(schema.expenses.id, id!))
    .returning()

  if (!updated) throw NotFoundError()

  return updated
})
