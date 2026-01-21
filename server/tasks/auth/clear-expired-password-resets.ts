import { lte } from 'drizzle-orm'

export default defineTask({
  async run() {
    await db.delete(schema.passwordResets)
      .where(lte(schema.passwordResets.expiresAt, new Date()))

    return { result: true }
  },
})
