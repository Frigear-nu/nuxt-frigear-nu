<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { AuthError } from '@supabase/auth-js'

const schema = z.object({
  email: z.email('Ugyldig e-post.'),
})

type Schema = z.output<typeof schema>

const $emits = defineEmits<{
  (e: 'loading'): void
  (e: 'success', email: string): void
  (e: 'error', error: Error | AuthError | z.ZodError): void
  (e: 'development', magicLink: unknown): void
}>()

const { sendMagicLink } = useAuth()
const form = useTemplateRef('form')
const emailValue = defineModel<string | undefined>('email')
const mode = defineModel<'in' | 'up'>('mode', { default: 'in' })
const displayModal = defineModel<boolean>('open', { default: false })

const state = reactive<Partial<Schema>>({
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

  try {
    const magicLink = await sendMagicLink(email)
    if (import.meta.dev) console.log({ magicLink })

    if (typeof magicLink === 'object' && magicLink?.local) {
      return $emits('development', magicLink)
    }

    $emits('success', email)
  }
  catch (error: unknown) {
    $emits('error', error as Error | AuthError | z.ZodError)
  }
}
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
        v-if="form"
        type="submit"
        :loading="form.loading"
        @click="form.submit()"
      >
        Submit
      </UButton>
    </template>
  </UModal>
</template>
