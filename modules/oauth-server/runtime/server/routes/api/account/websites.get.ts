import { db } from '@nuxthub/db'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  return db.query.oauthClients.findMany({
    where: (t, { and, eq, like }) => {
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
