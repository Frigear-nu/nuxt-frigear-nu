import { defineAbility } from 'nuxt-authorization/utils'
import type { Users } from '@nuxthub/db/schema'

export const isAdmin = defineAbility((user: Users) => {
  return user.role === 'admin'
})

export const canViewAdminArea = defineAbility((user: Users) => {
  return ['admin', 'manager'].includes(user.role)
})
