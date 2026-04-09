import { defineAbility } from 'nuxt-authorization/utils'
import type { User } from '@nuxthub/db/schema'

export const isAdmin = defineAbility((user: User) => {
  return user.role === 'admin'
})

export const canViewAdminArea = defineAbility((user: User) => {
  return ['admin', 'manager'].includes(user.role)
})
