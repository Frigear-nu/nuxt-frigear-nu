import type { Users } from '@nuxthub/db/schema'
import { defineAbility } from 'nuxt-authorization/utils'

export const canListUsers = defineAbility((user: Users) => {
  return user.role === 'admin'
})
