<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const toast = useToast()
const mode = defineModel<'in' | 'up'>('mode', { default: 'in' })
const supabase = useSupabaseClient()
const authForm = useTemplateRef('authForm')
const displayMagicLinkModal = ref(false)
const displayForgotPasswordModal = ref(false)
const emailWasDispatched = ref(false)
const { fields, buildProviders } = useSiteAuth()

const emailField = computed<string | undefined>({
  get: () => authForm.value?.state?.email,
  set: (v) => {
    if (!authForm.value) return
    authForm.value.state.email = v!
  },
})

const providers = buildProviders((provider) => {
  switch (provider) {
    case 'link':
      displayMagicLinkModal.value = true
      break
    case 'google':
    // case 'github':
      return supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: withBaseUrl('/auth/confirm'),
        },
      })
    default:
      toast.add(formatToastError(new Error(`Provider '${provider}', is not implemented.`)))
  }
})

// TODO: Translations
const schema = z.object({
  email: z.email('Ugyldig e-post.'),
  password: z.string('Passord er påkrævet').min(8, 'Must be at least 8 characters'),
})

type Schema = z.output<typeof schema>

const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) toast.add(formatToastError(error))
  if (!data.user) throw createError('Could not load user.')

  // todo: not sure if this redirect is correct.
  return navigateTo('/account')
}

const signUp = async (email: string, password: string) => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: withBaseUrl('/auth/confirm'),
    },
  })

  if (error) toast.add(formatToastError(error))
  else {
    toast.add(formatToastSuccess('Sign up successful!'))
    await signIn(email, password)
  }
}

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  const email = payload.data.email
  const password = payload.data.password
  if (mode.value === 'up') await signUp(email, password)
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
      :schema="schema"
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
        </ULink>.
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
