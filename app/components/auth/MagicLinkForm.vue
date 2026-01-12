<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { AuthError } from '@supabase/auth-js'
import { withLeadingUrl } from '#shared/supabase'

const $emits = defineEmits<{
  (e: 'success', email: string): void
  (e: 'error', error: Error | AuthError | z.ZodError): void
}>()

const schema = z.object({
  email: z.email('Ugyldig e-post.'),
})

type Schema = z.output<typeof schema>

const supabase = useSupabaseClient()
const toast = useToast()

const state = reactive<Partial<Schema>>({
  email: undefined,
})

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  const { data: email, error } = z.safeParse(z.email(), payload.data.email)

  if (error) {
    $emits('error', error)
    throw error
  }

  const { error: supabaseError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: withLeadingUrl('/auth/confirm'),
    },
  })

  if (supabaseError) {
    $emits('error', supabaseError)
  }

  toast.add({
    title: 'Yay!',
    description: 'Check your email for a link, it might be in your spam folder.',
    icon: 'i-lucide-check',
    color: 'success',
  })

  $emits('success', email)
}
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="space-y-4"
    @submit="onSubmit"
  >
    <UFormField
      label="E-post"
      name="email"
    >
      <UInput v-model="state.email" />
    </UFormField>
    <UButton
      type="submit"
    >
      Submit
    </UButton>
  </UForm>
</template>
