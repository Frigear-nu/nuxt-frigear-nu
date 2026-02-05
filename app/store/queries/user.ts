import { USER_KEYS } from '~/store/queryKeys'

export const useUserMemberships = () => {
  const { $api } = useNuxtApp()

  return useQuery({
    key: () => USER_KEYS.membership,
    query: () => $api('/api/account/memberships'),
    placeholderData: () => [],
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
