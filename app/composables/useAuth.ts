import type { AuthProvider } from '~/types'

export const useAuth = () => {
  // const nuxtApp = useNuxtApp()
  const sbAuth = useSupabaseAuth()
  const customAuth = useCustomAuth()

  const authMode = computed<'custom' | 'supabase'>(() => {
    return 'custom'
  })

  const currentUser = computed(() => {
    return authMode.value === 'supabase' ? sbAuth.currentUser.value : customAuth.currentUser.value
  })

  const isLoggedIn = computed(() => {
    return !!currentUser.value
  })

  const sendMagicLink = async (email: string) => {
    switch (authMode.value) {
      case 'supabase':
        return sbAuth.sendMagicLink(email)
      case 'custom':
        return customAuth.sendMagicLink(email)
      default:
        throw new Error(`Auth mode ${authMode.value} not supported.`)
    }
  }

  const signInWithProvider = async (provider: AuthProvider) => {
    switch (authMode.value) {
      case 'supabase':
        return sbAuth.signInWithProvider(provider)
      case 'custom':
        return customAuth.signInWithProvider(provider)
      default:
        throw new Error(`Auth mode ${authMode.value} not supported.`)
    }
  }

  const signInWithPassword = async (email: string, password: string) => {
    switch (authMode.value) {
      case 'supabase':
        return sbAuth.signInWithPassword(email, password)
      case 'custom':
        return customAuth.signInWithPassword(email, password)
      default:
        throw new Error(`Auth mode ${authMode.value} not supported.`)
    }
  }
  const signUpWithPassword = async (email: string, password: string, meta?: { name?: string }) => {
    switch (authMode.value) {
      case 'supabase':
        return sbAuth.signUpWithPassword(email, password)
      case 'custom':
        return customAuth.signUpWithPassword(meta?.name || email, email, password)
      default:
        throw new Error(`Auth mode ${authMode.value} not supported.`)
    }
  }

  const refresh = async () => {
    switch (authMode.value) {
      case 'supabase':
        await sbAuth.supabase.auth.refreshSession()
        break
      case 'custom':
        await customAuth.custom.refresh()
        break
      default:
        throw new Error(`Auth mode ${authMode.value} not supported.`)
    }
  }

  const signOut = async () => {
    switch (authMode.value) {
      case 'supabase':
        await sbAuth.supabase.auth.signOut()
        break
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
    sendMagicLink,
    signInWithProvider,
    signInWithPassword,
    signUpWithPassword,
    refresh,
    signOut,
  }
}
