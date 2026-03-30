import { defineAbility } from 'nuxt-authorization/utils'
import type { Users } from '@nuxthub/db/schema'

export const canViewAllExpenses = defineAbility((user: Users) => {
  return ['admin', 'manager'].includes(user.role)
})

export const canApproveExpense = defineAbility((user: Users) => {
  return ['admin', 'manager'].includes(user.role)
})
