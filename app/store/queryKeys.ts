export const ROOT_KEYS = {
  memberships: ['memberships'] as const,
  user: ['user'] as const,
}

export const USER_KEYS = {
  membership: [...ROOT_KEYS.user, 'membership'],
  paymentMethods: [...ROOT_KEYS.user, 'paymentMethods'],
}
