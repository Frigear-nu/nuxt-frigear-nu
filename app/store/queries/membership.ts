import { ROOT_KEYS } from '../queryKeys'

export const useMemberships = () => {
  return useQuery({
    key: () => ROOT_KEYS.memberships,
    query: () => $fetch('/api/memberships'),
  })
}
