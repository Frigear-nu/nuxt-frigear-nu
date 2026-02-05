import { USER_KEYS } from '~/store/queryKeys'

export const useSubscribeUser = () => {
  const { $api } = useNuxtApp()
  const cache = useQueryCache()
  return useMutation({
    key: () => USER_KEYS.membership,
    mutation: (priceId: string) => $api('/api/account/membership', {
      method: 'POST',
      body: { priceId },
    }),
    async onSettled() {
      await cache.invalidateQueries({ key: USER_KEYS.membership })
      await cache.invalidateQueries({ key: USER_KEYS.paymentMethods })
    },
  })
}

export const useStripeBillingPortalUrl = () => {
  const { $api } = useNuxtApp()

  return useMutation({
    key: () => USER_KEYS.paymentMethods,
    mutation: () => $api('/api/account/payment-method', {
      method: 'POST',
    }),
  })
}
