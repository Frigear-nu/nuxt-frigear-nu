<script setup lang="ts">
import type { ZodError } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { AuthError } from '@supabase/auth-js'
import {
  signInWithMagicLinkSchema,
  type SignInWithMagicLinkSchema, signUpWithMagicLinkSchema,
  type SignUpWithMagicLinkSchema,
} from '#shared/schema/auth'
import type { z } from 'zod/v4'

const $emits = defineEmits<{
  (e: 'loading'): void
  (e: 'success', email: string): void
  (e: 'error', error: Error | AuthError | ZodError): void
  (e: 'development', magicLink: unknown): void
}>()

const { signInWithMagicLink, signUpWithMagicLink } = useAuth()
const form = useTemplateRef('form')
const emailValue = defineModel<string | undefined>('email')
const mode = defineModel<'in' | 'up'>('mode', { default: 'in' })
const displayModal = defineModel<boolean>('open', { default: false })

const schema = signUpWithMagicLinkSchema.or(signInWithMagicLinkSchema)
const state = reactive <Partial<z.infer<typeof schema>>>({
  name: undefined,
  email: undefined,
})

const nameField = computed({
  get: () => state.name,
  set: (name: string) => state.name = name.trim(),
})

watch(emailValue, (em) => {
  state.email = em
})

const handleMagicLink = (email: string, magicLink: { local?: boolean } | unknown) => {
  if (import.meta.dev) console.log({ magicLink })
  if (magicLink && typeof magicLink === 'object' && 'local' in magicLink && magicLink?.local) {
    return $emits('development', magicLink)
  }

  $emits('success', email)
}

async function onSignIn(payload: FormSubmitEvent<SignInWithMagicLinkSchema>) {
  const email = payload.data.email
  $emits('loading')

  const magicLink = await signInWithMagicLink(email)
  handleMagicLink(email, magicLink)
}

async function onSignUp(payload: FormSubmitEvent<SignUpWithMagicLinkSchema>) {
  const { name, email } = payload.data
  $emits('loading')
  const magicLink = await signUpWithMagicLink({ name, email })
  handleMagicLink(email, magicLink)
}

// Typed onSubmit using conditional types
async function onSubmit<
  M extends 'in' | 'up' = typeof mode.value,
  T = M extends 'in' ? SignInWithMagicLinkSchema : SignUpWithMagicLinkSchema,
>(
  payload: FormSubmitEvent<T>,
) {
  console.log({ data: payload.data })
  try {
    if (mode.value === 'in') {
      return onSignIn(payload as FormSubmitEvent<SignInWithMagicLinkSchema>)
    }
    return onSignUp(payload as FormSubmitEvent<SignUpWithMagicLinkSchema>)
  }
  catch (error: unknown) {
    $emits('error', error as Error | AuthError | ZodError)
  }
}
</script>

<template>
  <UModal
    v-model:open="displayModal"
    :title="$t(mode === 'in' ? 'auth.magicLink.modal.in.title' : 'auth.magicLink.modal.up.title')"
    :description="$t(mode === 'in' ? 'auth.magicLink.modal.in.description' : 'auth.magicLink.modal.up.description')"
  >
    <template #body>
      <UForm
        ref="form"
        :schema="schema"
        :state="state"
        class="space-y-4"
        :loading-auto="true"
        @submit="onSubmit"
      >
        <UFormField
          v-if="state && mode && mode === 'up'"
          :label="$t('auth.name.label')"
        >
          <UInput
            v-model="nameField"
            type="text"
            autocomplete="name"
            :placeholder="$t('auth.name.placeholder')"
            class="w-full"
          />
        </UFormField>
        <UFormField
          :label="$t('auth.email.label')"
          name="email"
        >
          <UInput
            v-model="state.email"
            type="email"
            autocomplete="email"
            :placeholder="$t('auth.email.placeholder')"
            class="w-full"
          />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <UButton
        v-if="form"
        type="submit"
        :loading="form?.loading"
        @click="form?.submit()"
      >
        {{ $t(mode === 'in' ? 'auth.magicLink.submit' : 'auth.signUp') }}
      </UButton>
    </template>
  </UModal>
</template>
