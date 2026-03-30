import { ROOT_KEYS } from '../queryKeys'
import { useQuery } from '@pinia/colada'

export const useMemberships = () => {
  const { $api } = useNuxtApp()
  return useQuery({
    key: () => ROOT_KEYS.memberships,
    query: () => $api('/api/memberships'),
  })
}
