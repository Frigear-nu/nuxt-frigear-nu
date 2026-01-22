import type { AuthFormField, ButtonProps } from '@nuxt/ui'
import { useSiteI18n } from '#imports'

type Provider = ButtonProps & { id: string }
type ProviderHandler = (provider: string) => void

const useAuthForm = () => {
  const { t } = useSiteI18n()
  const fields = ref<AuthFormField[]>([
    {
      name: 'email',
      type: 'email',
      autocomplete: 'email',
      label: t('auth.email.label'),
      placeholder: t('auth.placeholder.email'),
      required: true,
    },
    {
      name: 'password',
      type: 'password',
      autocomplete: 'password',
      label: t('auth.password.label'),
      placeholder: t('auth.password.placeholder'),
      required: true,
    },
  ] as AuthFormField[])

  const signUpFields = computed<AuthFormField[]>(() => {
    return [
      {
        name: 'name',
        type: 'text',
        autocomplete: 'name',
        label: t('auth.name.label'),
        placeholder: t('auth.name.placeholder'),
        required: true,
      },
      ...toValue(fields) as AuthFormField[],
    ]
  })

  const providers = ref<Provider[]>([
    {
      id: 'google',
      label: 'auth.provider.google',
      icon: 'i-simple-icons-google',
    },
    {
      id: 'link',
      label: 'auth.provider.link',
      icon: 'i-lucide-at-sign',
    },
  ])

  const buildProviders = (handler: ProviderHandler): ButtonProps[] => {
    return toValue(providers).map((provider) => {
      return {
        ...provider,
        label: provider.label ? t(provider.label) : undefined,
        onClick: () => handler(provider.id),
      }
    })
  }

  return { fields, signUpFields, buildProviders }
}

export default useAuthForm
