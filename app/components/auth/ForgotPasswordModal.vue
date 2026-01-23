<script lang="ts" setup>
import { useAuth } from '#imports'
import type { ForgotPasswordSchema } from '#shared/schema/auth'
import { forgotPasswordSchema } from '#shared/schema/auth'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { AuthError } from '@supabase/auth-js'
import type { ZodError } from 'zod'

const $emits = defineEmits<{
  (e: 'loading'): void
  (e: 'success', email: string): void
  (e: 'error', error: Error | AuthError | ZodError): void
  (e: 'development', magicLink: unknown): void
}>()

const displayModal = defineModel<boolean>('open', { default: false })
const emailValue = defineModel<string | undefined>('email')

const { sendForgotPasswordEmail } = useAuth()
const form = useTemplateRef('form')

const DEFAULT_STATE: Partial<ForgotPasswordSchema> = {
  email: undefined,
}

const state = reactive<typeof DEFAULT_STATE>({ ...DEFAULT_STATE })

watch(emailValue, (em) => {
  state.email = em
})

async function onSubmit(payload: FormSubmitEvent<ForgotPasswordSchema>) {
  const email = payload.data.email
  try {
    $emits('loading')
    const forgotPassword = await sendForgotPasswordEmail(email)
    if (import.meta.dev) console.log({ forgotPassword })

    if (typeof forgotPassword === 'object' && forgotPassword?.local) {
      return $emits('development', forgotPassword)
    }

    $emits('success', email)
  }
  catch (error: unknown) {
    $emits('error', error as Error | AuthError | ZodError)
  }
}
</script>

<template>
  <UModal
    v-model:open="displayModal"
    :title="$t('auth.forgotPassword.title')"
  >
    <template #body>
      <UForm
        ref="form"
        :schema="forgotPasswordSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          :label="$t('auth.email.label')"
          name="email"
        >
          <UInput
            v-model="state.email"
            :placeholder="$t('auth.email.placeholder')"
            autocomplete="email"
          />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <div class="flex justify-end w-full gap-2">
        <UButton
          :label="$t('actions.cancel')"
          trailing-icon="i-lucide-x"
          @click="displayModal = false"
        />
        <UButton
          v-if="form"
          :label="$t('auth.forgotPassword.submit')"
          trailing-icon="i-lucide-arrow-right"
          type="submit"
          :loading="form.loading"
          @click="form.submit()"
        />
      </div>
    </template>
  </UModal>
</template>
