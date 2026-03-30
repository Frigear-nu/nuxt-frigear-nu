<script setup lang="ts">
import type { Users, Expense } from '@nuxthub/db/schema'

const { $api } = useNuxtApp()
const { t } = useSiteI18n()

type ExpenseWithUser = Expense & { user: Pick<Users, 'id' | 'name' | 'email'> }

const { data: expenses, refresh } = await useAsyncData<ExpenseWithUser[]>(
  'admin:expenses',
  () => $api('/api/admin/expenses'),
  { default: () => [] },
)

const selectedExpense = ref<ExpenseWithUser | undefined>(undefined)
const slideoverOpen = ref(false)
const isUpdating = ref(false)

const onViewExpense = (expense: ExpenseWithUser) => {
  selectedExpense.value = expense
  slideoverOpen.value = true
}

const statusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'success'
    case 'rejected': return 'error'
    default: return 'warning'
  }
}

const updateStatus = async (status: 'approved' | 'rejected' | 'pending', close: () => void) => {
  if (!selectedExpense.value) return
  isUpdating.value = true
  try {
    await $api(`/api/admin/expenses/${selectedExpense.value.id}`, {
      method: 'PATCH',
      body: { status },
    })
    await refresh()
    close()
  }
  finally {
    isUpdating.value = false
  }
}
</script>

<template>
  <div>
    <UContainer class="flex flex-col gap-8">
      <UPageHeader
        title="Expenses"
        :links="[{ label: 'Admin', to: $localePath('/admin'), icon: 'i-lucide-home' }]"
      />

      <UPageList v-if="expenses && expenses.length">
        <UPageCard
          v-for="expense in expenses"
          :key="expense.id"
          :title="`${expense.amount.toFixed(2)} DKK`"
          :ui="{
            header: 'flex items-start justify-between gap-2',
            footer: 'flex items-center gap-2',
          }"
        >
          <template #description>
            <div class="flex flex-col gap-1">
              <span><b>{{ $t('admin.expenses.user') }}:</b> {{ expense.user.name }} ({{ expense.user.email }})</span>
              <span v-if="expense.description"><b>{{ $t('admin.expenses.description') }}:</b> {{ expense.description }}</span>
              <span><b>{{ $t('admin.expenses.attachments') }}:</b> {{ expense.attachments.length }}</span>
            </div>
          </template>
          <template #footer>
            <UBadge
              :color="statusColor(expense.status)"
              variant="subtle"
            >
              {{ expense.status }}
            </UBadge>
            <UButton
              icon="i-lucide-eye"
              variant="outline"
              color="neutral"
              size="sm"
              @click="onViewExpense(expense)"
            />
          </template>
        </UPageCard>
      </UPageList>

      <UEmpty
        v-else
        title="No expenses yet"
        description="Expenses submitted by members will appear here."
      />
    </UContainer>

    <USlideover
      v-model:open="slideoverOpen"
      :title="selectedExpense ? `${selectedExpense.amount.toFixed(2)} DKK` : ''"
      side="right"
    >
      <template #body>
        <div
          v-if="selectedExpense"
          class="flex flex-col gap-4 p-4"
        >
          <div>
            <p class="text-sm text-muted">
              {{ $t('admin.expenses.user') }}
            </p>
            <p class="font-semibold">
              {{ selectedExpense.user.name }}
            </p>
            <p class="text-sm text-muted">
              {{ selectedExpense.user.email }}
            </p>
          </div>

          <div v-if="selectedExpense.description">
            <p class="text-sm text-muted">
              {{ $t('admin.expenses.description') }}
            </p>
            <p>{{ selectedExpense.description }}</p>
          </div>

          <div>
            <p class="text-sm text-muted mb-2">
              {{ $t('admin.expenses.attachments') }}
            </p>
            <div
              v-if="selectedExpense.attachments.length"
              class="flex flex-col gap-2"
            >
              <a
                v-for="attachment in selectedExpense.attachments"
                :key="attachment"
                :href="`/api/expenses/media/${attachment}`"
                target="_blank"
                class="flex items-center gap-2 text-primary underline text-sm"
              >
                <UIcon name="i-lucide-paperclip" />
                {{ attachment.split('/').pop() }}
              </a>
            </div>
            <p
              v-else
              class="text-sm text-muted"
            >
              {{ $t('admin.expenses.noAttachments') }}
            </p>
          </div>

          <div>
            <p class="text-sm text-muted">
              {{ $t('admin.expenses.status') }}
            </p>
            <UBadge
              :color="statusColor(selectedExpense.status)"
              variant="subtle"
            >
              {{ selectedExpense.status }}
            </UBadge>
          </div>
        </div>
      </template>
      <template #footer="{ close }">
        <UButton
          :label="t('admin.expenses.approve')"
          color="success"
          icon="i-lucide-check"
          :loading="isUpdating"
          :disabled="selectedExpense?.status === 'approved'"
          @click="updateStatus('approved', close)"
        />
        <UButton
          :label="t('admin.expenses.reject')"
          color="error"
          variant="outline"
          icon="i-lucide-x"
          :loading="isUpdating"
          :disabled="selectedExpense?.status === 'rejected'"
          @click="updateStatus('rejected', close)"
        />
        <UButton
          :label="$t('common.close')"
          color="neutral"
          variant="ghost"
          class="ml-auto"
          @click="close"
        />
      </template>
    </USlideover>
  </div>
</template>
