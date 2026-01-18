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
      label: t('form.label.email'),
      placeholder: t('form.placeholder.email'),
      required: true,
    },
    {
      name: 'password',
      type: 'password',
      label: t('form.label.password'),
      placeholder: t('form.placeholder.password'),
      required: true,
    },
  ])

  const signUpFields = computed<AuthFormField[]>(() => {
    return [
      {
        name: 'name',
        type: 'text',
        autocomplete: 'name',
        label: t('form.label.name'),
        placeholder: t('form.placeholder.name'),
        required: true,
      },
      ...toValue(fields) as AuthFormField[],
    ]
  })

  const providers = ref<Provider[]>([
    {
      id: 'google',
      label: 'form.placeholder.google',
      icon: 'i-simple-icons-google',
    },
    {
      id: 'link',
      label: 'form.placeholder.magic-link',
      icon: 'i-lucide-at-sign',
    },
  ])

  const buildProviders = (handler: ProviderHandler): ButtonProps[] => {
    return toValue(providers).map((provider) => {
      return {
        ...provider,
        label: t(provider.label),
        onClick: () => handler(provider.id),
      }
    })
  }

  return { fields, signUpFields, buildProviders }
}

export default useAuthForm
