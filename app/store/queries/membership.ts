import { ROOT_KEYS } from '../queryKeys'
import { useQuery } from '@pinia/colada'
import type { PricingPlanProps } from '@nuxt/ui'

export const useMemberships = () => {
  const { $api } = useNuxtApp()

  return useQuery({
    key: () => ROOT_KEYS.memberships,
    query: async () => {
      return $api<(PricingPlanProps & { interval: string, id: string })[]>('/api/memberships')
    },
  })
}
