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

const useAuthForm = () => {
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

  const signUpFields = computed<AuthFormField[]>(() => {
    return [
      {
        name: 'name',
        type: 'text',
        autocomplete: 'name',
        label: 'fields.name',
        placeholder: 'labels.name',
        required: true,
      },
      ...toValue(fields) as AuthFormField[],
    ]
  })

  const buildProviders = (handler: ProviderHandler): ButtonProps[] => {
    return providers.map((provider) => {
      return {
        ...provider,
        onClick: () => handler(provider.id),
      }
    })
  }

  return { fields, signUpFields, buildProviders }
}

export default useAuthForm
