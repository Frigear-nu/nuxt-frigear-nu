<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const toast = useToast()
const { fields } = useSiteAuth()
const supabase = useSupabaseClient()
const authForm = useTemplateRef('authForm')
const displayMagicLinkModal = ref(false)
const emailWasDispatched = ref(false)

const emailField = computed<string | undefined>({
  get: () => authForm.value?.state?.email,
  set: (v) => {
    if (!authForm.value) return
    authForm.value.state.email = v!
  },
})

const providers = [{
  label: 'Google',
  icon: 'i-simple-icons-google',
  onClick: () => {
    toast.add(formatToastError(new Error('Provider not implemented.')))
  },
},
{
  label: 'Magic Link',
  icon: 'i-lucide-at-sign',
  onClick: () => {
    displayMagicLinkModal.value = true
  },
},
]

// TODO: Translations
const schema = z.object({
  email: z.email('Ugyldig e-post.'),
  password: z.string('Passord er påkrævet').min(8, 'Must be at least 8 characters'),
})

type Schema = z.output<typeof schema>

async function onSubmitEmailAndPassword(payload: FormSubmitEvent<Schema>) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.data.email,
    password: payload.data.password,
  })

  if (error) {
    toast.add(formatToastError(error))

    return
  }

  if (!data.user) {
    throw createError('Could not load user.')
  }

  navigateTo('/account')
}

function onMagicLinkDispatched(email: string) {
  emailField.value = email
  displayMagicLinkModal.value = false
  emailWasDispatched.value = true
  toast.add({
    title: 'Yay!',
    description: 'Check your email for a link, it might be in your spam folder.',
    icon: 'i-lucide-check',
    color: 'success',
  })
}

function onMagicLinkError(err: Error) {
  toast.add(formatToastError(err))

  displayMagicLinkModal.value = false
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
      title="Sign In"
      :fields="fields"
      :providers="providers"
      :separator="{ label: 'OR' }"
      @submit="onSubmitEmailAndPassword"
    >
      <template #description>
        Don't have an account?
        <ULink
          to="#"
          class="text-primary font-medium"
        >Sign up
        </ULink>
        .
      </template>
      <template #password-hint>
        <ULink
          to="#"
          class="text-primary font-medium"
          tabindex="-1"
        >Forgot password?
        </ULink>
      </template>
    </UAuthForm>
    <AuthMagicLinkModal
      v-model:open="displayMagicLinkModal"
      v-model:email="emailField"
      @error="onMagicLinkError"
      @success="onMagicLinkDispatched"
    />
  </UPageCard>
</template>
