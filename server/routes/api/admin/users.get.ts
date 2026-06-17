import { authorize } from 'nuxt-authorization/utils'
import { isAdmin } from '#shared/abilities/admin'
import { db } from '@nuxthub/db'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  await authorize(isAdmin, user)

  return db.query.users.findMany({
    columns: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      roskildePeopleId: true,
      emailVerifiedAt: true,
      createdAt: true,
    },
  })
})
