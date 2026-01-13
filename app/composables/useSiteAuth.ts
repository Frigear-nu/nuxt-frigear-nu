import type { AuthFormField } from '@nuxt/ui'

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
    {
      name: 'remember',
      label: 'Remember me',
      type: 'checkbox',
    },
  ])

  return { fields }
}

export default useSiteAuth
