import type { AuthFormField, ButtonProps } from '@nuxt/ui'

type Provider = ButtonProps & { id: string }
type ProviderHandler = (provider: string) => void

const providers: Provider[] = [
  {
    id: 'google',
    label: 'Google',
    icon: 'i-simple-icons-google',
  },
  {
    id: 'link',
    label: 'Magic Link',
    icon: 'i-lucide-at-sign',
  },
]

const useSiteAuth = () => {
  const fields = ref<AuthFormField[]>([
    {
      name: 'email',
      type: 'email',
      autocomplete: 'email',
      label: 'Email',
      placeholder: 'Din najs email...',
      required: true,
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      placeholder: 'Enter your password',
      required: true,
    },
  ])

  const buildProviders = (handler: ProviderHandler): ButtonProps[] => {
    return providers.map((provider) => {
      return {
        ...provider,
        onClick: () => handler(provider.id),
      }
    })
  }

  return { fields, buildProviders }
}

export default useSiteAuth
