<script setup lang="ts">
import { useAdminListUsers, useAdminGetUser } from '~/store/queries/admin/users'
import type { TableColumn, TableRow } from '@nuxt/ui'

type User = {
  id: number
  name: string
  email: string
  role: string
  avatarUrl: string | null
  emailVerifiedAt: Date | null
  lastLoginAt: Date | null
  createdAt: Date | null
}

const { data: users } = await useAdminListUsers()

const selectedUserId = ref<number | null>(null)
const isSlideoverOpen = computed({
  get: () => selectedUserId.value !== null,
  set: (v) => { if (!v) selectedUserId.value = null },
})

const { data: selectedUser } = useAdminGetUser(selectedUserId)

function openUser(row: TableRow<User>) {
  selectedUserId.value = row.original.id
}

const columns: TableColumn<User>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'emailVerifiedAt', header: 'Email Verified' },
  { accessorKey: 'lastLoginAt', header: 'Last Login' },
  { accessorKey: 'createdAt', header: 'Joined' },
  { id: 'actions', header: '' },
]

function formatDate(date: Date | string | null | undefined) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString(undefined, { dateStyle: 'medium' })
}
</script>

<template>
  <div>
    <UContainer class="flex flex-col gap-8">
      <UPageHeader
        title="Users"
        :links="[{ label: 'Admin', to: $localePath('/admin'), icon: 'i-lucide-home' }]"
      />
      <UTable
        v-if="users && users.length"
        :data="users"
        :columns="columns"
        class="w-full"
      >
        <template #emailVerifiedAt-cell="{ row }">
          <UBadge
            v-if="row.original.emailVerifiedAt"
            color="success"
            variant="subtle"
            icon="i-lucide-check"
            label="Verified"
          />
          <UBadge
            v-else
            color="warning"
            variant="subtle"
            icon="i-lucide-clock"
            label="Unverified"
          />
        </template>
        <template #role-cell="{ row }">
          <UBadge
            :label="row.original.role"
            variant="outline"
          />
        </template>
        <template #lastLoginAt-cell="{ row }">
          {{ formatDate(row.original.lastLoginAt) }}
        </template>
        <template #createdAt-cell="{ row }">
          {{ formatDate(row.original.createdAt) }}
        </template>
        <template #actions-cell="{ row }">
          <UButton
            icon="i-lucide-eye"
            variant="ghost"
            color="neutral"
            size="sm"
            @click="openUser(row)"
          />
        </template>
      </UTable>
      <UEmpty
        v-else
        title="No users yet!"
      />
    </UContainer>

    <USlideover
      v-model:open="isSlideoverOpen"
      :title="selectedUser?.name ?? 'User details'"
    >
      <template #body>
        <div
          v-if="selectedUser"
          class="flex flex-col gap-4 p-4"
        >
          <UPageCard
            :title="selectedUser.name"
            :description="selectedUser.email"
          >
            <template #leading>
              <UAvatar
                :src="selectedUser.avatarUrl ?? undefined"
                :alt="selectedUser.name"
                size="xl"
              />
            </template>
          </UPageCard>

          <UCard>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-sm text-muted font-medium mb-1">
                  Role
                </div>
                <UBadge
                  :label="selectedUser.role"
                  variant="outline"
                />
              </div>
              <div>
                <div class="text-sm text-muted font-medium mb-1">
                  Email verified
                </div>
                <UBadge
                  v-if="selectedUser.emailVerifiedAt"
                  color="success"
                  variant="subtle"
                  icon="i-lucide-check"
                  :label="formatDate(selectedUser.emailVerifiedAt)"
                />
                <UBadge
                  v-else
                  color="warning"
                  variant="subtle"
                  icon="i-lucide-clock"
                  label="Not verified"
                />
              </div>
              <div>
                <div class="text-sm text-muted font-medium mb-1">
                  Last login
                </div>
                <span class="text-sm">{{ formatDate(selectedUser.lastLoginAt) }}</span>
              </div>
              <div>
                <div class="text-sm text-muted font-medium mb-1">
                  Joined
                </div>
                <span class="text-sm">{{ formatDate(selectedUser.createdAt) }}</span>
              </div>
            </div>
          </UCard>
        </div>
        <div
          v-else
          class="flex items-center justify-center h-full"
        >
          <UIcon
            name="i-lucide-loader"
            class="animate-spin"
            size="xl"
          />
        </div>
      </template>
      <template #footer="{ close }">
        <UButton
          label="Close"
          color="neutral"
          variant="outline"
          icon="i-lucide-x"
          size="xl"
          @click="close"
        />
      </template>
    </USlideover>
  </div>
</template>
