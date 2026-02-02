import { db, schema } from '@nuxthub/db'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  return db.query.stripeSubscriptions.findMany({
  })
})
