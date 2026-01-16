import type { AuthProvider } from '~/types'

export const useSupabaseAuth = () => {
  const supabase = useSupabaseClient()
  const supabaseUser = useSupabaseUser()

  const currentUser = computed(() => supabaseUser.value || undefined)

  const redirectTo = withBaseUrl('/auth/confirm')

  const sendMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // todo: change this to /auth/confirm when the redirect url has been added to supabase
        emailRedirectTo: redirectTo,
        shouldCreateUser: true,
      },
    })

    if (error) throw error

    return true
  }

  const signInWithProvider = async (provider: AuthProvider) => {
    const { error, data } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    })

    if (error) throw error

    return navigateTo(data.url, { external: true })
  }

  const signInWithPassword = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    if (!data.user) throw createError('Could not load user.')

    return data.user
  }

  const signUpWithPassword = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
      },
    })

    if (error) throw error

    return data.user
  }

  return {
    currentUser,
    sendMagicLink,
    signInWithProvider,
    signInWithPassword,
    signUpWithPassword,
  }
}
