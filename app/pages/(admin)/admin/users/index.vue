<script setup lang="ts">
import { LazyAdminUsersCreateDialog, LazyAdminUsersEditDialog, UTable } from '#components'
import type { Table } from '@tanstack/vue-table'
import type { ButtonProps, TableColumn, TableRow } from '@nuxt/ui'
import { useAdminUsers } from '~/store/queries/admin'

const { users } = useAdminUsers()

// @ts-expect-error Not typed :/...
const table = useTemplateRef<{ tableApi: Table }>('table')
const overlay = useOverlay()
const createUserDialog = overlay.create(LazyAdminUsersCreateDialog)
const editUserDialog = overlay.create(LazyAdminUsersEditDialog)
const confirmAction = useConfirmDialog()

const onSelectRow = (_: Event, row: TableRow<never>) => {
  editUserDialog.open({
    user: toRaw(row.original),
  })
}

const headerActions = computed<ButtonProps[]>(() => [
  {
    label: 'Create User',
    icon: 'i-lucide-user-plus',
    onClick() {
      createUserDialog.open()
    },
  },
])

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UCheckbox = resolveComponent('UCheckbox')

const { pagination, globalFilter, getPaginationRowModel, getSortedRowModel } = useTablePagination()
const selectedRows = computed(() => table.value?.tableApi?.getFilteredSelectedRowModel()?.rows || [])
const allRows = computed(() => table.value?.tableApi?.getFilteredRowModel()?.rows || [])

const columns: TableColumn<typeof users.value[number]>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        'modelValue': table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        'aria-label': 'Select all',
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        'modelValue': row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
        'aria-label': 'Select row',
      }),
  },
  {
    id: 'id',
    header: 'ID',
    accessorKey: 'id',
    cell: ({ row }) => row.original.id,
  },
  {
    id: 'peopleNumber',
    header: 'People Number',
    accessorKey: 'roskildePeopleId',
    cell: ({ row }) => row.original.roskildePeopleId || 'n/a',
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
    cell: ({ row }) => row.original.email,
  },
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    cell: ({ row }) => row.original.name,
  },
  {
    id: 'role',
    header: 'Role',
    accessorKey: 'role',
    cell: ({ row }) => row.original.role,
  },
  {
    id: 'actions',
    header: 'Actions',
    meta: {
      class: {
        td: 'text-right',
      },
    },
    cell: ({ row }) => h(UDropdownMenu, {
      'items': [
        {
          label: 'DELETE',
          icon: 'i-lucide-trash',
          color: 'error',
          onClick: async () => {
            const confirmed = await confirmAction({
              title: 'Delete User',
              description: `Are you sure you want to delete ${row.original.email}? This action cannot be undone.`,
            })

            if (!confirmed) {
              useToast().add({
                title: 'Action cancelled',
              })
              return
            }

            // DELETE?
            useToast().add({
              title: 'Not yet implemented.',
              description: 'But should have deleted :/',
              color: 'info',
            })
          },
        },
      ],
      'aria-label': 'Actions dropdown',
    },
    () =>
      h(UButton, {
        'icon': 'i-lucide-ellipsis-vertical',
        'color': 'neutral',
        'variant': 'ghost',
        'aria-label': 'Actions dropdown',
      })),
  },
]
</script>

<template>
  <UContainer>
    <AdminPageHeader
      title="Users"
      :links="headerActions"
    />
    <UPageBody>
      <div class="flex flex-col md:flex-row gap-4">
        <UFormField label="Filter">
          <UInput
            v-model="globalFilter"
            class="max-w-sm p-0"
            placeholder="Filter..."
            size="lg"
          />
        </UFormField>
        <UFormField v-if="selectedRows.length > 0">
          <template #label>
            With {{ selectedRows.length }} selected {{ selectedRows.length === 1 ? 'domain' : 'users' }}:
          </template>
          <div class="flex gap-2">
            <!--            <UButton -->
            <!--              v-for="(action, index) in selectedDomainsActions" -->
            <!--              :key="index" -->
            <!--              v-bind="action" -->
            <!--            /> -->
          </div>
        </UFormField>
      </div>
      <UPageCard
        v-if="users && users.length > 0"
        variant="subtle"
        :ui="{ container: 'p-0 sm:p-0' }"
      >
        <div class="w-full space-y-4 pb-4">
          <UTable
            ref="table"
            v-model:pagination="pagination"
            v-model:global-filter="globalFilter"
            :columns="columns"
            :data="users"
            :pagination-options="{
              getPaginationRowModel: getPaginationRowModel(),
              getSortedRowModel: getSortedRowModel(),
            }"
            class="flex-1"
            @select="onSelectRow as never"
          />
          <div class="flex justify-between border-t border-accented">
            <div class="px-4 py-3.5 text-sm text-muted">
              {{ selectedRows.length || 0 }} of
              {{ allRows.length || 0 }} row(s) selected.
            </div>
            <div class="pt-4 px-4">
              <UPagination
                :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
                :items-per-page="table?.tableApi?.getState().pagination.pageSize"
                :total="allRows.length"
                @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)"
              />
            </div>
          </div>
        </div>
      </UPageCard>
      <UEmpty
        v-else
        title="No users found"
        description="Create a user to get started..."
      />
    </UPageBody>
  </UContainer>
</template>
