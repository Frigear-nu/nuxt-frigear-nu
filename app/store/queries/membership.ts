import { ROOT_KEYS } from '../queryKeys'
import { useQuery } from '@pinia/colada'

export const useMemberships = () => {
  return useQuery({
    key: () => ROOT_KEYS.memberships,
    query: () => $fetch('/api/memberships'),
  })
}
