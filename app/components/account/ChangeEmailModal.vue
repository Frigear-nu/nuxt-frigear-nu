<script setup lang="ts">
import type { ZodError } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { AuthError } from '@supabase/auth-js'
import { changeUserEmailSchema, type ChangeUserEmailSchema } from '#shared/schema/user'

const $emits = defineEmits<{
  (e: 'loading'): void
  (e: 'success', email: string): void
  (e: 'error', error: Error | AuthError | ZodError): void
  (e: 'development', magicLink: unknown): void
}>()

const form = useTemplateRef('form')
const emailValue = defineModel<string | undefined>('email')
const displayModal = defineModel<boolean>('open', { default: false })

const state = reactive<Partial<ChangeUserEmailSchema>>({
  email: undefined,
})

watch(emailValue, (em) => {
  state.email = em
})

async function onSubmit(payload: FormSubmitEvent<ChangeUserEmailSchema>) {
  const email = payload.data.email
  $emits('loading')

  try {
    const changeEmail = { local: false }
    if (import.meta.dev) console.log({ magicLink: changeEmail })

    if (typeof changeEmail === 'object' && changeEmail?.local) {
      return $emits('development', changeEmail)
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
    title="Change E-mail address"
  >
    <template #body>
      <UForm
        ref="form"
        :schema="changeUserEmailSchema"
        :state="state"
        class="space-y-4"
        :loading-auto="true"
        @submit="onSubmit"
      >
        <UFormField
          label="New E-mail"
          name="email"
        >
          <UInput
            v-model="state.email"
            type="email"
            autocomplete="email"
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
