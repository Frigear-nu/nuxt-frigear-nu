<script lang="ts" setup>
import { useUrlSearchParams } from '@vueuse/core'
import { type ResetPasswordSchema, resetPasswordSchema } from '#shared/schema/auth'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useAuth, useToast, useSiteI18n } from '#imports'

const searchParams = useUrlSearchParams<{ code?: string }>('history')
onMounted(() => {
  if (!searchParams.token) {
    throw createError({
      statusCode: 404,
    })
  }
})

const { resetPassword, refresh } = useAuth()
const { localePath } = useSiteI18n()

const form = useTemplateRef('form')
const toast = useToast()
const state = reactive<Partial<ResetPasswordSchema>>({
  code: undefined,
  password: undefined,
  confirmPassword: undefined,
})

watchEffect(() => {
  if (searchParams.code) state.code = searchParams.code
})

async function onSubmit(payload: FormSubmitEvent<ResetPasswordSchema>) {
  const { code, password, confirmPassword } = payload.data
  try {
    await resetPassword(code, password, confirmPassword)
    await refresh()
    toast.add(formatToastSuccess('Password has been set.'))
    await navigateTo(localePath('/account'))
  }
  catch (err: unknown) {
    toast.add(formatToastError(err as never))
  }
}
</script>

<template>
  <UForm
    id="reset-password"
    ref="form"
    :schema="resetPasswordSchema"
    :state="state"
    class="w-full max-w-md"
    @submit="onSubmit"
  >
    <UPageCard
      title="Reset password"
      variant="subtle"
      class="space-y-4"
    >
      <UFormField label="Password">
        <UInput
          v-model="state.password"
          type="password"
          autocomplete="new-password"
        />
      </UFormField>
      <UFormField label="Confirm Password">
        <UInput
          v-model="state.confirmPassword"
          type="password"
          autocomplete="new-password"
        />
      </UFormField>
      <div class="flex justify-end">
        <UButton
          v-if="form"
          type="submit"
          trailing-icon="i-lucide-check"
          :loading="form.loading"
          @click="form.submit()"
        >
          Reset password
        </UButton>
      </div>
    </UPageCard>
  </UForm>
</template>
