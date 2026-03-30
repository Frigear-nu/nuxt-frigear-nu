import { z } from 'zod'

export const updateExpenseStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
})

export type UpdateExpenseStatusSchema = z.output<typeof updateExpenseStatusSchema>
