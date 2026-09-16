export const roleIsHigher = <T>(
  roles: T[] | readonly T[],
  sourceRole: T,
  compareRole: T,
) => {
  if (!sourceRole || !compareRole) return false
  if (!roles.includes(sourceRole) || !roles.includes(compareRole)) return false
  return roles.indexOf(sourceRole) < roles.indexOf(compareRole)
}

export const roleIsHigherOrEqual = <T>(
  roles: T[] | readonly T[],
  sourceRole: T,
  compareRole: T,
) => {
  if (!sourceRole || !compareRole) return false
  if (!roles.includes(sourceRole) || !roles.includes(compareRole)) return false
  return roles.indexOf(sourceRole) <= roles.indexOf(compareRole)
}

export const canAssignRole = <T>(
  roles: T[] | readonly T[],
  sourceRole: T,
  compareRole: T,
) => {
  if (!sourceRole || !compareRole) return false
  if (!roles.includes(sourceRole) || !roles.includes(compareRole)) return false

  const sourceIndex = roles.indexOf(sourceRole)
  const compareIndex = roles.indexOf(compareRole)
  const adminIndex = roles.indexOf('admin' as T)

  if (adminIndex === -1) {
    return sourceIndex < compareIndex
  }

  return sourceIndex <= adminIndex
    ? sourceIndex <= compareIndex
    : sourceIndex < compareIndex
}
