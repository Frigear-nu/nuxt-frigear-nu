import { userRoles } from '#shared/schema/user'

export const userRoleIsHigher = (
  baseRole: typeof userRoles[number],
  targetRole: typeof userRoles[number],
) => {
  return userRoles.indexOf(baseRole) > userRoles.indexOf(targetRole)
}
