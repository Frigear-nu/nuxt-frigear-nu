import { ROOT_KEYS } from '../queryKeys'
import { useQuery } from '@pinia/colada'
import type { PricingPlanProps } from '@nuxt/ui'
import { useUserMemberships } from '~/store/queries/user'

export const useMemberships = () => {
  const { $api } = useNuxtApp()
  // we also need to know if the user has any membership,
  // if they do we will show all available subscriptions no matter what...
  const { loggedIn } = useUserSession()
  const {
    data: userMemberships,
  } = useUserMemberships({ isEnabled: loggedIn })

  // TODO: This should probably be a config on the product/price in stripe via metadata...
  const roskildeSeasonGap = computed(() => [
    new Date(`06-15-${new Date().getFullYear()}`),
    new Date(`07-07-${new Date().getFullYear()}`),
  ])

  const isWithinRoskildeSeason = computed(() => {
    if (loggedIn.value && userMemberships.value && userMemberships.value.length > 0) {
      return false
    }
    if (!roskildeSeasonGap.value) {
      return false
    }
    const now = new Date()
    return roskildeSeasonGap.value[0]! <= now && now <= roskildeSeasonGap.value[1]!
  })

  return useQuery({
    key: () => ROOT_KEYS.memberships,
    query: async () => {
      const memberships = await $api<(PricingPlanProps & { interval: string, id: string })[]>('/api/memberships')

      return memberships
        .filter((price) => {
          if (isWithinRoskildeSeason.value && price.interval === 'month' && price.intervalCount === 1) {
            return false
          }

          return true
        })
    },
  })
}
