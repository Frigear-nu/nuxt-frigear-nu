<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

const supabase = useSupabaseClient()
const toast = useToast()

const displayMagicLinkModal = ref(false)

const fields = ref<AuthFormField[]>([
  {
    name: 'email',
    type: 'email',
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

const providers = [{
  label: 'Google',
  icon: 'i-simple-icons-google',
  onClick: () => {
    toast.add({ title: 'Google', description: 'Login with Google' })
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
    toast.add({
      title: 'Whoops!',
      description: error.message,
      color: 'error',
    })

    return
  }

  if (!data.user) {
    throw createError('Could not load user.')
  }

  return navigateTo('/account')
}

function onMagicLinkDispatched(email: string) {
  toast.add({ description: 'It was dispatched.' })
  displayMagicLinkModal.value = false
}

function onMagicLinkError(err: Error) {
  toast.add({
    description: err.message,
  })
  displayMagicLinkModal.value = false
}
</script>

<template>
  <UPageCard class="w-full max-w-md">
    <UAuthForm
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
    <UModal
      v-model:open="displayMagicLinkModal"
      title="Sign in with Magic Link"
    >
      <template #body>
        <div class="m-4">
          <AuthMagicLinkForm
            @success="onMagicLinkDispatched"
            @error="onMagicLinkError"
          />
        </div>
      </template>
    </UModal>
  </UPageCard>
</template>
