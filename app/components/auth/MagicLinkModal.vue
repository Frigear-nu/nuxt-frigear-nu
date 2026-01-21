<script setup lang="ts">
import type { ZodError } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { AuthError } from '@supabase/auth-js'
import { signInWithMagicLinkSchema, type SignInWithMagicLinkSchema } from '#shared/schema/auth'

const $emits = defineEmits<{
  (e: 'loading'): void
  (e: 'success', email: string): void
  (e: 'error', error: Error | AuthError | ZodError): void
  (e: 'development', magicLink: unknown): void
}>()

const { sendMagicLink } = useAuth()
const form = useTemplateRef('form')
const emailValue = defineModel<string | undefined>('email')
const mode = defineModel<'in' | 'up'>('mode', { default: 'in' })
const displayModal = defineModel<boolean>('open', { default: false })

const state = reactive<Partial<SignInWithMagicLinkSchema>>({
  email: undefined,
})

watch(emailValue, (em) => {
  state.email = em
})

async function onSubmit(payload: FormSubmitEvent<SignInWithMagicLinkSchema>) {
  const email = payload.data.email
  $emits('loading')

  try {
    const magicLink = await sendMagicLink(email)
    if (import.meta.dev) console.log({ magicLink })

    if (typeof magicLink === 'object' && magicLink?.local) {
      return $emits('development', magicLink)
    }

    $emits('success', email)
  }
  catch (error: unknown) {
    $emits('error', error as Error | AuthError | ZodError)
  }
}

// FIXME: Need translations.
</script>

<template>
  <UModal
    v-model:open="displayModal"
    :title="mode === 'in' ? 'Sign in with Magic Link' : 'Sign up with Magic Link'"
    description="Fyll ut skjemaet så sender vi deg en magic link, så slipper du streve med passord."
  >
    <template #body>
      <UForm
        ref="form"
        :schema="signInWithMagicLinkSchema"
        :state="state"
        class="space-y-4"
        :loading-auto="true"
        @submit="onSubmit"
      >
        <UFormField
          label="E-post"
          name="email"
        >
          <UInput
            v-model="state.email"
            type="email"
            autocomplete="email"
            class="min-w-sm max-w-md"
          />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <UButton
        v-if="form"
        type="submit"
        :loading="form.loading"
        @click="form.submit()"
      >
        {{ $t('auth.magicLink.submit') }}
      </UButton>
    </template>
  </UModal>
</template>
