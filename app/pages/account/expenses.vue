<script setup lang="ts">
import { useSiteI18n } from '#imports'
import type { Expense } from '@nuxthub/db/schema'

const { t } = useSiteI18n()
const { $api } = useNuxtApp()
const toast = useToast()

const { data: expenses, refresh } = await useAsyncData<Expense[]>(
  'account:expenses',
  () => $api('/api/account/expenses'),
  { default: () => [] },
)

const isSubmitting = ref(false)
const amount = ref<number | undefined>(undefined)
const description = ref('')
const files = ref<File[]>([])

const fileInputRef = ref<HTMLInputElement>()

const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return
  files.value = Array.from(input.files)
}

const onSubmit = async () => {
  if (!amount.value || amount.value <= 0) {
    toast.add(formatToastError(new Error(t('account.expenses.form.amountRequired'))))
    return
  }
  if (files.value.length === 0) {
    toast.add(formatToastError(new Error(t('account.expenses.form.attachmentRequired'))))
    return
  }

  isSubmitting.value = true
  try {
    const formData = new FormData()
    formData.append('amount', String(amount.value))
    if (description.value) {
      formData.append('description', description.value)
    }
    for (const file of files.value) {
      formData.append('attachments', file)
    }

    await $api('/api/account/expenses', {
      method: 'POST',
      body: formData,
    })

    toast.add(formatToastSuccess(t('account.expenses.form.success')))
    amount.value = undefined
    description.value = ''
    files.value = []
    if (fileInputRef.value) fileInputRef.value.value = ''
    await refresh()
  }
  catch (err: unknown) {
    toast.add(formatToastError(err as Error))
  }
  finally {
    isSubmitting.value = false
  }
}

const statusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'success'
    case 'rejected': return 'error'
    default: return 'warning'
  }
}

const statusLabel = (status: string) => {
  switch (status) {
    case 'approved': return t('account.expenses.status.approved')
    case 'rejected': return t('account.expenses.status.rejected')
    default: return t('account.expenses.status.pending')
  }
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <UPageCard
      variant="subtle"
      :title="t('account.expenses.form.title')"
    >
      <div class="flex flex-col gap-4">
        <UFormField
          :label="t('account.expenses.form.amount')"
          required
        >
          <UInput
            v-model="amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
          />
        </UFormField>

        <UFormField :label="t('account.expenses.form.description')">
          <UTextarea
            v-model="description"
            :placeholder="t('account.expenses.form.descriptionPlaceholder')"
          />
        </UFormField>

        <UFormField
          :label="t('account.expenses.form.attachments')"
          :description="t('account.expenses.form.attachmentsDescription')"
          required
        >
          <input
            ref="fileInputRef"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
            @change="onFileChange"
          >
        </UFormField>

        <div>
          <UButton
            :label="t('account.expenses.form.submit')"
            color="neutral"
            icon="i-lucide-upload"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            @click="onSubmit"
          />
        </div>
      </div>
    </UPageCard>

    <div v-if="expenses && expenses.length > 0">
      <h2 class="text-xl font-semibold mb-4">
        {{ t('account.expenses.list.title') }}
      </h2>
      <UPageGrid class="grid-cols-1 md:grid-cols-2">
        <UPageCard
          v-for="expense in expenses"
          :key="expense.id"
          :ui="{
            header: 'flex items-start justify-between gap-2',
          }"
        >
          <template #header>
            <span class="text-lg font-bold">{{ expense.amount.toFixed(2) }} DKK</span>
            <UBadge
              :color="statusColor(expense.status)"
              variant="subtle"
              size="lg"
            >
              {{ statusLabel(expense.status) }}
            </UBadge>
          </template>
          <template #body>
            <p
              v-if="expense.description"
              class="text-sm text-muted"
            >
              {{ expense.description }}
            </p>
            <p class="text-xs text-muted">
              {{ t('account.expenses.list.attachments') }}: {{ expense.attachments.length }}
            </p>
          </template>
        </UPageCard>
      </UPageGrid>
    </div>

    <UEmpty
      v-else-if="expenses && expenses.length === 0"
      :title="t('account.expenses.list.empty')"
    />
  </div>
</template>
