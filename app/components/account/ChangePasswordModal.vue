<script setup lang="ts">
import type { ZodError } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { changeUserPasswordSchema, type ChangeUserPasswordSchema } from '#shared/schema/user'

const $emits = defineEmits<{
  (e: 'loading' | 'success'): void
  (e: 'error', error: Error | ZodError): void
}>()

const { changePassword } = useAccount()
const form = useTemplateRef('form')
const displayModal = defineModel<boolean>('open', { default: false })

const state = reactive<Partial<ChangeUserPasswordSchema>>({
  currentPassword: undefined,
  newPassword: undefined,
  confirmNewPassword: undefined,
})

async function onSubmit(payload: FormSubmitEvent<ChangeUserPasswordSchema>) {
  $emits('loading')

  try {
    await changePassword(payload.data)
    $emits('success')
  }
  catch (error: unknown) {
    $emits('error', error as Error | ZodError)
  }
  finally {
    if (form.value) form.value.clear()
  }
}

// FIXME: Need translations.
</script>

<template>
  <UModal
    v-model:open="displayModal"
    :title="$t('auth.changePassword.title')"
  >
    <template #body>
      <UForm
        id="change-password"
        ref="form"
        :schema="changeUserPasswordSchema"
        :state="state"
        class="space-y-4"
        :loading-auto="true"
        @submit="onSubmit"
      >
        <UFormField
          :label="$t('auth.changePassword.current.label')"
          name="currentPassword"
        >
          <UInput
            v-model="state.currentPassword"
            type="password"
            autocomplete="current-password"
          />
        </UFormField>

        <UFormField
          :label="$t('auth.changePassword.new.label')"
          name="newPassword"
        >
          <UInput
            v-model="state.newPassword"
            type="password"
            autocomplete="new-password"
          />
        </UFormField>

        <UFormField
          :label="$t('auth.changePassword.confirm.label')"
          name="confirmNewPassword"
        >
          <UInput
            v-model="state.confirmNewPassword"
            type="password"
            autocomplete="new-password"
          />
        </UFormField>
        <ULink
          to="/sign-in"
          class="underline"
        >
          {{ $t('auth.forgotPassword.title') }}
        </ULink>
      </UForm>
    </template>
    <template #footer>
      <UButton
        v-if="form"
        id="change-password"
        type="submit"
        :loading="form?.loading"
        @click="form?.submit()"
      >
        {{ $t('auth.changePassword.submit') }}
      </UButton>
    </template>
  </UModal>
</template>
