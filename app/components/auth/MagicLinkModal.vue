<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { AuthError } from '@supabase/auth-js'
import { withLeadingUrl } from '#shared/supabase'

const schema = z.object({
  email: z.email('Ugyldig e-post.'),
})

type Schema = z.output<typeof schema>

const $emits = defineEmits<{
  (e: 'loading'): void
  (e: 'success', email: string): void
  (e: 'error', error: Error | AuthError | z.ZodError): void
}>()

const supabase = useSupabaseClient()
const form = useTemplateRef('form')
const emailValue = defineModel<string | undefined>('email')
const displayModal = defineModel<boolean>('open', {
  default: false,
})

const state = reactive({
  email: undefined,
})

watch(emailValue, (em) => {
  state.email = em
})

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  const { data: email, error } = z.safeParse(z.email(), payload.data.email)

  if (error) {
    return $emits('error', error)
  }

  $emits('loading')

  const { error: supabaseError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: withLeadingUrl('/auth/confirm'),
    },
  })

  if (supabaseError) {
    return $emits('error', supabaseError)
  }

  $emits('success', email)
}
</script>

<template>
  <UModal
    v-model:open="displayModal"
    title="Sign in with Magic Link"
    description="Fyll ut skjemaet så sender vi deg en magic link, så slipper du streve med passord."
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
        type="submit"
        @click="form.submit()"
      >
        Submit
      </UButton>
    </template>
  </UModal>
</template>
