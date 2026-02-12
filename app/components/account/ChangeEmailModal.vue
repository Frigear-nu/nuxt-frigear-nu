<script setup lang="ts">
import type { ZodError } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { changeUserEmailSchema, type ChangeUserEmailSchema } from '#shared/schema/user'

const $emits = defineEmits<{
  (e: 'loading'): void
  (e: 'success', email: string): void
  (e: 'error', error: Error | ZodError): void
  (e: 'development', magicLink: unknown): void
}>()

const { changeEmailAddress } = useAccount()
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
    const changeEmail = await changeEmailAddress(payload.data)
    if (import.meta.dev) console.log({ magicLink: changeEmail })

    if (typeof changeEmail === 'object' && changeEmail?.local) {
      return $emits('development', changeEmail)
    }

    $emits('success', email)
  }
  catch (error: unknown) {
    $emits('error', error as Error | ZodError)
  }
}
</script>

<template>
  <UModal
    v-model:open="displayModal"
    :title="$t('account.profile.email.change.title')"
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
          :label="$t('account.profile.email.change.label')"
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
        :loading="form?.loading"
        @click="form?.submit()"
      >
        {{ $t('auth.magicLink.submit') }}
      </UButton>
    </template>
  </UModal>
</template>
