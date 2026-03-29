import { useQuery } from '@pinia/colada'
import { ADMIN_KEYS } from '~/store/queryKeys'

export const useAdminListUsers = () => {
  const { $api } = useNuxtApp()
  const { loggedIn } = useUserSession()

  return useQuery({
    key: () => ADMIN_KEYS.users,
    query: () => {
      return $api('/api/admin/users')
    },
    placeholderData: () => [],
    enabled: () => import.meta.client && loggedIn.value,
  })
}

export const useAdminGetUser = (id: MaybeRefOrGetter<number | null>) => {
  const { $api } = useNuxtApp()
  const { loggedIn } = useUserSession()

  return useQuery({
    key: () => ADMIN_KEYS.user(toValue(id)!),
    query: () => $api(`/api/admin/users/${toValue(id)}`),
    enabled: () => import.meta.client && loggedIn.value && toValue(id) !== null,
  })
}
