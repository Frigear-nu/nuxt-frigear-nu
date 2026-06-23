import { userRoles } from '#shared/schema/user'

export const userRoleIsHigher = (
  baseRole: typeof userRoles[number],
  targetRole: typeof userRoles[number],
) => {
  if (!baseRole || !targetRole) return false
  return userRoles.indexOf(baseRole) > userRoles.indexOf(targetRole)
}
