import type { AuthProvider } from '~/types'

export const useCustomAuth = () => {
  const { session } = useUserSession()

  const currentUser = computed(() => session.value?.user)

  const sendMagicLink = async (email: string) => {
    const result = await $fetch(`/api/auth/magic-link`, {
      method: 'POST',
      body: { email },
    })
    if (!result) throw new Error('Could not send magic link.')

    return true
  }

  const signInWithProvider = async (provider: AuthProvider) => {
    switch (provider) {
      case 'google':
        return navigateTo(`/auth/${provider}`)

      default:
        throw new Error(`Provider ${provider} not supported by this driver.`)
    }
  }

  const signInWithPassword = async (email: string, password: string) => {
    throw new Error('Not yet implemented.')
  }
  const signUpWithPassword = async (email: string, password: string) => {
    throw new Error('Not yet implemented.')
  }

  return {
    currentUser,
    sendMagicLink,
    signInWithProvider,
    signInWithPassword,
    signUpWithPassword,
  }
}
