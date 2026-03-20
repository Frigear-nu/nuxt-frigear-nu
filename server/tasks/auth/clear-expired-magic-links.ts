import { and, lte } from 'drizzle-orm'
import { subDays } from 'date-fns'

export default defineTask({
  async run() {
    await db.delete(schema.magicLinks)
      .where(and(
        lte(schema.magicLinks.expiresAt, new Date()),
        lte(schema.magicLinks.usedAt, subDays(new Date(), 2)),
      ))

    return { result: true }
  },
})
