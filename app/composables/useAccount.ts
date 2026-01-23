import type { ChangeUserEmailSchema, UpdateUserProfileSchema } from '#shared/schema/user'

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

  const changeEmailAddress = async (body: ChangeUserEmailSchema) => {
    return $fetch('/api/account/change-email', {
      method: 'POST',
      body,
    })
  }

  return {
    updateProfileDetails,
    changeEmailAddress,
  }
}
