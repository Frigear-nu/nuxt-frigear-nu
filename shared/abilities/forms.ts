import { defineAbility } from 'nuxt-authorization/utils'
import type { User } from '@nuxthub/db/schema'

const allowedRoles: User['role'][] = ['admin', 'manager']

export const canViewForms = defineAbility((user: User) => {
  return allowedRoles.includes(user.role)
})

export const canViewFormSubmissions = defineAbility((user: User) => {
  return allowedRoles.includes(user.role)
})
