import { db, schema } from '@nuxthub/db'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  return db.query.oauthClients.findMany({
    where: (t, { and, eq, like, ilike }) => {
      return and(
        eq(t.isActive, true),
        like(t.allowedRoles, `%"${user.role}"%`),
      )
    },
    columns: {
      id: true,
      name: true,
      websiteUrl: true,
    },
  })
})
