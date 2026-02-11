import { USER_KEYS } from '~/store/queryKeys'
import { useQuery } from '@pinia/colada'

export const useUserMemberships = ({ isEnabled }: { isEnabled?: MaybeRefOrGetter<boolean> } = {}) => {
  const { $api } = useNuxtApp()

  return useQuery({
    key: () => USER_KEYS.membership,
    query: () => $api('/api/account/memberships'),
    placeholderData: () => [],
    enabled: isEnabled ? isEnabled : () => true,
  })
}

export const useUserPaymentMethods = () => {
  const { $api } = useNuxtApp()

  return useQuery({
    key: () => USER_KEYS.paymentMethods,
    query: () => $api('/api/account/payment-methods'),
    placeholderData: () => [],
  })
}
