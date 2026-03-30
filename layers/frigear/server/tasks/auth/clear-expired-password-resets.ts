import { and, lte } from 'drizzle-orm'
import { subDays } from 'date-fns'

export default defineTask({
  async run() {
    await db.delete(schema.passwordResets)
      .where(and(
        lte(schema.passwordResets.expiresAt, new Date()),
        lte(schema.passwordResets.expiresAt, subDays(new Date(), 2)),
      ))

    return { result: true }
  },
})
