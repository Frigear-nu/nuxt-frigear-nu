import type { ChangeUserEmailSchema, ChangeUserPasswordSchema, UpdateUserProfileSchema } from '#shared/schema/user'

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

  const changePassword = async (body: ChangeUserPasswordSchema) => {
    const result = await $fetch('/api/account/change-password', {
      method: 'POST',
      body,
    })

    await refresh()

    return result
  }

  return {
    updateProfileDetails,
    changeEmailAddress,
    changePassword,
  }
}
