import { authorize } from 'nuxt-authorization/utils'
import { canListUsers } from '#shared/abilities/admin/users'
import { db } from '@nuxthub/db'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  await authorize(canListUsers, user)

  return db.query.users.findMany({
    columns: {
      passwordHash: false,
    },
  })
})
