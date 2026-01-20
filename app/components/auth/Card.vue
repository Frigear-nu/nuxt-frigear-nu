<script setup lang="ts">
import {
  type SignInWithPasswordSchema,
  signInWithPasswordSchema,
  type SignUpWithPasswordSchema,
} from '#shared/schema/auth'
import { signUpWithPasswordSchema } from '#shared/schema/auth'
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'

const toast = useToast()
const mode = defineModel<'in' | 'up'>('mode', { default: 'in' })
const authForm = useTemplateRef('authForm')
const displayMagicLinkModal = ref(false)
const displayForgotPasswordModal = ref(false)
const emailWasDispatched = ref(false)
const { fields: signInFields, signUpFields, buildProviders } = useAuthForm()
const {
  authMode,
  signInWithPassword,
  signInWithProvider,
  signUpWithPassword,
} = useAuth()

const isDevelopment = computed(() => import.meta.dev ?? false)

const emailField = computed<string | undefined>({
  get: () => authForm.value?.state?.email,
  set: (v) => {
    if (!authForm.value) return
    authForm.value.state.email = v!
  },
})

const fields = computed<AuthFormField[]>((): AuthFormField[] => {
  if (mode.value === 'in') {
    return toValue(signInFields) as AuthFormField[]
  }

  return toValue(signUpFields)
})

const providers = buildProviders((provider) => {
  switch (provider) {
    case 'link':
      displayMagicLinkModal.value = true
      break
    case 'google':
      // case 'github':
      return signInWithProvider(provider)
    default:
      toast.add(formatToastError(new Error(`Provider '${provider}', is not implemented.`)))
  }
})

const signIn = async (email: string, password: string) => {
  const signedInUser = await signInWithPassword(email, password).catch((error) => {
    if (error) toast.add(formatToastError(error))
  })
  if (!signedInUser) throw createError('Could not load user.')

  // todo: not sure if this redirect is correct.
  return navigateTo('/account')
}

const signUp = async (email: string, password: string, meta?: { name?: string }) => {
  const createdUser = await signUpWithPassword(email, password, meta).catch((error) => {
    if (error) toast.add(formatToastError(error))
  })

  if (!createdUser) {
    throw new Error('Could not create user.')
  }

  // @ts-expect-error This is not typed
  if (!createdUser.emailConfirmedAt) {
    toast.add(formatToastSuccess('Check your mail for a confirmation email'))
    emailWasDispatched.value = true
    return
  }

  return navigateTo('/account')
}

async function onSubmit(payload: FormSubmitEvent<SignInWithPasswordSchema | SignUpWithPasswordSchema>) {
  const email = payload.data.email
  const password = payload.data.password
  if (mode.value === 'up') await signUp(email, password, payload.data as { name?: string })
  else await signIn(email, password)
}

function onMagicLinkDispatched(email: string) {
  emailField.value = email
  displayMagicLinkModal.value = false
  emailWasDispatched.value = true
  toast.add(formatToastSuccess('Yay!', 'Check your email for a link, it might be in your spam folder.'))
}

function onMagicLinkError(err: Error) {
  toast.add(formatToastError(err))
  displayMagicLinkModal.value = false
}

function onMagicLinkDevelopment(magicLink: unknown) {
  toast.add(formatToastSuccess('Check the terminal for Magic Link 👨‍💻'))
  if (import.meta.dev) console.log({ magicLink })
  displayMagicLinkModal.value = false
  if (!emailWasDispatched.value) emailWasDispatched.value = true
}

function onPasswordResetDispatched(email: string) {
  emailField.value = email
  displayForgotPasswordModal.value = false
  emailWasDispatched.value = true
  toast.add(formatToastSuccess('Mail away!', 'We\'ve sent you an email to reset your password.'))
}
</script>

<template>
  <UPageCard class="w-full max-w-md">
    <div
      v-if="emailWasDispatched"
      class="flex flex-col items-center justify-center gap-4 p-4 text-center"
    >
      <div class="text-xl font-bold">
        E-mail sent!
      </div>
      <p>Please check your inbox, you might want to check your SPAM folder.</p>
      <p>You may close this window.</p>
    </div>
    <UAuthForm
      v-else
      ref="authForm"
      :schema="mode === 'up' ? signUpWithPasswordSchema : signInWithPasswordSchema"
      :title="mode === 'up' ? 'Sign Up' : 'Sign In'"
      :fields="fields"
      :providers="providers"
      :separator="{ label: 'OR' }"
      :submit="mode === 'up' ? { label: 'Sign Up' } : { label: 'Sign In' }"
      @submit="onSubmit"
    >
      <template #description>
        {{ mode === 'up' ? 'Already have an account?' : 'Don\'t have an account?' }}
        <ULink
          class="text-primary font-medium"
          @click="mode = mode === 'up' ? 'in' : 'up'"
        >
          {{ mode === 'up' ? 'Sign in' : 'Sign up' }}
        </ULink>
        .

        <UBadge
          v-if="isDevelopment"
          color="error"
        >
          Auth: {{ authMode }}
        </UBadge>
      </template>
      <template
        v-if="mode === 'in'"
        #password-hint
      >
        <ULink
          class="text-primary font-medium"
          tabindex="-1"
          @click="displayForgotPasswordModal = true"
        >Forgot password?
        </ULink>
      </template>
    </UAuthForm>
    <AuthMagicLinkModal
      v-model:open="displayMagicLinkModal"
      v-model:email="emailField"
      v-model:mode="mode"
      @error="onMagicLinkError"
      @success="onMagicLinkDispatched"
      @development="onMagicLinkDevelopment"
    />
    <AuthForgotPasswordModal
      v-model:open="displayForgotPasswordModal"
      v-model:email="emailField"
      @success="onPasswordResetDispatched"
    />
  </UPageCard>

  <div class="flex gap-4">
    <UButton
      icon="i-lucide-x"
      variant="soft"
      to="/"
    >
      Avbryt
    </UButton>
    <UButton
      v-if="!emailWasDispatched"
      trailing-icon="i-lucide-arrow-right"
      variant="subtle"
      @click="mode = mode === 'up' ? 'in' : 'up'"
    >
      {{ mode === 'in' ? 'Opret konto' : 'Log ind' }}
    </UButton>
  </div>
</template>
