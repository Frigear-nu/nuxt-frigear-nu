import type { UpdateUserProfileSchema } from '#shared/schema/user'

export const useAccount = () => {
  const { refresh } = useAuth()
  const updateProfileDetails = async (body: UpdateUserProfileSchema) => {
    const response = await $fetch('/api/account/profile', {
      method: 'POST',
      body,
    })

    await refresh()

    return response
  }

  return {
    updateProfileDetails,
  }
}
