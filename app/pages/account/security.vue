<script setup lang="ts">
import type { ButtonProps, PageCardProps } from '@nuxt/ui'
import { useSiteI18n, useToast } from '#imports'

const { t } = useSiteI18n()
const { formatError, formatSuccess } = useFormattedToast()
const toast = useToast()

const displayChangePasswordDialog = ref(false)

const cards = computed<(PageCardProps & { button?: ButtonProps })[]>(() => ([
  {
    title: t('account.security.password.title'),
    description: t('account.security.password.description'),
    icon: 'i-lucide-lock',
    variant: 'subtle',
    to: '#',
    button: {
      label: t('actions.change'),
      onClick() {
        displayChangePasswordDialog.value = true
      },
    },
  },
]))

const onPasswordChanged = () => {
  displayChangePasswordDialog.value = false
  toast.add(formatSuccess('Password changed!'))
}

const onPasswordChangeError = (err: unknown) => {
  // We only close the dialog if an unknown error occurs.
  // @ts-expect-error This cannot be typed :/
  if (!(err && err.data && err.data.message && err.data.message.includes('invalidPassword'))) {
    displayChangePasswordDialog.value = false
  }
  toast.add(formatError(err as Error))
}
</script>

<template>
  <UPageGrid class="lg:grid-cols-2">
    <UPageCard
      v-for="card in cards"
      :key="card.title"
      v-bind="{ ...card.button, ...card } as PageCardProps"
      orientation="horizontal"
    >
      <template #default>
        <div class="flex justify-between items-center gap-4">
          <div class="hidden lg:block" />
          <UButton
            size="xl"
            trailing-icon="i-lucide-arrow-right"
            class="justify-between gap-4 lg:w-auto hidden lg:flex"
            variant="outline"
            color="neutral"
            v-bind="card.button ? card.button : {}"
          />
        </div>
      </template>
    </UPageCard>
    <AccountChangePasswordModal
      v-model:open="displayChangePasswordDialog"
      @success="onPasswordChanged"
      @error="onPasswordChangeError"
    />
  </UPageGrid>
</template>
