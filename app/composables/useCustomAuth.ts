import type { AuthProvider } from '~/types'

export const useCustomAuth = () => {
  const { session, fetch: refreshSession, clear: clearSession } = useUserSession()

  const currentUser = computed(() => session.value?.user)

  const sendMagicLink = async (email: string) => {
    const result = await $fetch(`/api/auth/magic-link`, {
      method: 'POST',
      body: { email },
    })
    if (!result) throw new Error('Could not send magic link.')

    if (result.local) {
      return result
    }
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
    await refreshSession()
    throw new Error('Not yet implemented.')
  }
  const signUpWithPassword = async (email: string, password: string) => {
    await refreshSession()
    throw new Error('Not yet implemented.')
  }

  const refresh = async () => {
    await refreshSession()
  }

  const signOut = async () => {
    await clearSession()
  }

  return {
    currentUser,
    sendMagicLink,
    signInWithProvider,
    signInWithPassword,
    signUpWithPassword,
    custom: {
      refresh,
      signOut,
    },
  }
}
