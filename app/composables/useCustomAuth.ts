import type { AuthProvider } from '~/types'
import type { SignUpWithMagicLinkSchema } from '#shared/schema/auth'

export const useCustomAuth = () => {
  const { session, fetch: refreshSession, clear: clearSession, openInPopup } = useUserSession()

  const currentUser = computed(() => session.value?.user)

  const sendMagicLink = async (email: string) => {
    const result = await $fetch(`/api/auth/magic-link`, {
      method: 'POST',
      body: { email },
    })
    if (!result) throw new Error('Could not send magic link.')

    return result
  }

  const signUpWithMagicLink = async (body: SignUpWithMagicLinkSchema) => {
    const result = await $fetch(`/api/auth/sign-up/magic-link`, {
      method: 'POST',
      body,
    })

    if (!result) throw new Error('Could not sign up with magic link.')

    return result
  }

  const signInWithProvider = async (provider: AuthProvider) => {
    switch (provider) {
      case 'google':
        return openInPopup('/auth/google')

      default:
        throw new Error(`Provider ${provider} not supported by this driver.`)
    }
  }

  const signInWithPassword = async (email: string, password: string) => {
    await $fetch('/api/auth/sign-in', {
      method: 'POST',
      body: { email, password },
    })
    await refreshSession()
    return true
  }
  const signUpWithPassword = async (name: string, email: string, password: string) => {
    return $fetch('/api/auth/sign-up', {
      method: 'POST',
      body: { name, email, password },
    })
  }

  const sendForgotPasswordEmail = async (email: string) => {
    return $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email },
    })
  }

  const resetPassword = async (code: string, password: string, confirmPassword: string) => {
    return $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: { code, password, confirmPassword },
    })
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
    signUpWithMagicLink,
    signInWithProvider,
    signInWithPassword,
    signUpWithPassword,
    sendForgotPasswordEmail,
    resetPassword,
    custom: {
      refresh,
      signOut,
    },
  }
}
