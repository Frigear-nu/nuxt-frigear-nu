import { lte } from 'drizzle-orm'

export default defineTask({
  async run() {
    await db.delete(schema.magicLinks)
      .where(lte(schema.magicLinks.expiresAt, new Date()))

    return { result: true }
  },
})
