import type { AuthProvider } from '~/types'
import type { SignUpWithMagicLinkSchema } from '#shared/schema/auth'

export const useAuth = () => {
  // const nuxtApp = useNuxtApp()
  const customAuth = useCustomAuth()

  const authMode = computed<'custom'>(() => {
    return 'custom'
  })

  const currentUser = computed(() => {
    return customAuth.currentUser.value
  })

  const isLoggedIn = computed(() => {
    return !!currentUser.value
  })

  const signInWithMagicLink = async (email: string) => {
    switch (authMode.value) {
      case 'custom':
        return customAuth.sendMagicLink(email)
      default:
        throw new Error(`Auth mode ${authMode.value} not supported.`)
    }
  }

  const signUpWithMagicLink = async (body: SignUpWithMagicLinkSchema) => {
    return customAuth.signUpWithMagicLink(body)
  }

  const signInWithProvider = async (provider: AuthProvider) => {
    switch (authMode.value) {
      case 'custom':
        return customAuth.signInWithProvider(provider)
      default:
        throw new Error(`Auth mode ${authMode.value} not supported.`)
    }
  }

  const signInWithPassword = async (email: string, password: string) => {
    switch (authMode.value) {
      case 'custom':
        return customAuth.signInWithPassword(email, password)
      default:
        throw new Error(`Auth mode ${authMode.value} not supported.`)
    }
  }
  const signUpWithPassword = async (email: string, password: string, meta?: { name?: string }) => {
    switch (authMode.value) {
      case 'custom':
        return customAuth.signUpWithPassword(meta?.name || email, email, password)
      default:
        throw new Error(`Auth mode ${authMode.value} not supported.`)
    }
  }

  const sendForgotPasswordEmail = async (email: string) => {
    return customAuth.sendForgotPasswordEmail(email)
  }

  const resetPassword = async (code: string, password: string, confirmPassword: string) => {
    return customAuth.resetPassword(code, password, confirmPassword)
  }

  const refresh = async () => {
    switch (authMode.value) {
      case 'custom':
        await customAuth.custom.refresh()
        break
      default:
        throw new Error(`Auth mode ${authMode.value} not supported.`)
    }
  }

  const signOut = async () => {
    switch (authMode.value) {
      case 'custom':
        await customAuth.custom.signOut()
        break
      default:
        throw new Error(`Auth mode ${authMode.value} not supported.`)
    }
  }

  return {
    authMode,
    currentUser,
    isLoggedIn,
    signInWithMagicLink,
    signUpWithMagicLink,
    signInWithProvider,
    signInWithPassword,
    signUpWithPassword,
    sendForgotPasswordEmail,
    resetPassword,
    refresh,
    signOut,
  }
}
