<script setup lang="ts">
import type { PageCardProps, TableColumn } from '@nuxt/ui'
import { useSiteI18n } from '#imports'
import { allows, authorize } from 'nuxt-authorization/utils'
import { canViewForms } from '#shared/abilities/forms'
import { computedAsync } from '@vueuse/core'
import { upperFirst } from 'scule'
import { canViewAdminArea, canViewUsers, isAdmin } from '#shared/abilities/admin'

const { t, localePath } = useSiteI18n()
const { currentUser, currentUserRole } = useAuth()

const pageHeaderDescription = computed(() => {
  if (!currentUserRole.value) return undefined
  return `Role: ${upperFirst(currentUserRole.value)}`
})

const cards = computedAsync<PageCardProps[]>(async () => {
  const items: PageCardProps[] = [
    {
      title: 'Events',
      description: 'See all events, and their participants etc.',
      icon: 'i-lucide-calendars',
      to: localePath('/admin/events'),
      variant: 'subtle',
    },
  ]

  if (currentUser.value && await allows(canViewForms, currentUser.value)) {
    items.push({
      title: 'Forms',
      description: 'See all forms available, and their submissions.',
      icon: 'i-lucide-form',
      to: localePath('/admin/forms'),
      variant: 'subtle',
    })
  }

  if (currentUser.value && await allows(isAdmin, currentUser.value)) {
    items.push({
      title: 'OAuth',
      description: 'See View, edit and manage OAuth Applications that can sign in with frigear.nu',
      icon: 'i-lucide-server-cog',
      to: localePath('/admin/oauth'),
      variant: 'subtle',
    })
  }

  if (currentUser.value && await allows(canViewUsers, currentUser.value)) {
    items.push({
      title: 'Users',
      description: 'Manage all users in the system.',
      icon: 'i-lucide-users',
      to: localePath('/admin/users'),
      variant: 'subtle',
    })
  }

  return items
})

type NewMember = { id: number, name: string, email: string, interval?: string, subscription?: string, price?: number, signedUpAt: string }
const { data: newMembers, execute: fetchNewMembers } = useLazyFetch<NewMember[]>('/api/admin/dashboard/new-members')

watch(currentUser, async () => {
  if (currentUser.value && await authorize(canViewAdminArea, currentUser.value)) {
    await fetchNewMembers()
  }
})

const UBadge = resolveComponent('UBadge')

const newMembersTableColumns: TableColumn<NewMember>[] = [
  {
    id: 'id',
    header: 'ID',
    cell: ({ row }) => row.original.id,
  },
  {
    id: 'name',
    header: 'Name',
    cell: ({ row }) => row.original.name,
  },
  {
    id: 'email',
    header: 'Email',
    cell: ({ row }) => row.original.email,
  },
  {
    id: 'subscription',
    header: 'Subscription',
    cell: ({ row }) => h(UBadge, {
      variant: 'subtle',
      color: row.original.subscription && row.original.interval
        ? 'success'
        : 'neutral',
    }, () => {
      if (!row.original.subscription || !row.original.interval) {
        return 'None'
      }
      return [row.original.subscription, row.original.interval].join(' / ')
    }),
  },
  {
    id: 'signedUpAt',
    header: 'Signed Up At',
    cell: ({ row }) => new Date(row.original.signedUpAt).toLocaleString(),
  },
]
</script>

<template>
  <div>
    <UContainer>
      <UPageBody>
        <UPageHeader
          title="Admin Area"
          :description="pageHeaderDescription"
        >
          <template #links>
            <div
              v-if="currentUser"
              class="flex flex-col"
            >
              <div class="text-sm text-muted">
                {{ $t('auth.signedInAs') }}:
              </div>
              <div class="text-primary">
                {{ currentUser.email }}
              </div>
            </div>
          </template>
        </UPageHeader>
        <UPageGrid class="lg:grid-cols-2 mt-4">
          <UPageCard
            v-for="card in cards"
            :key="card.title"
            v-bind="card"
            orientation="horizontal"
          >
            <template #default>
              <div class="flex justify-between items-center gap-4">
                <div class="hidden lg:block" />
                <UButton
                  :to="card.to"
                  size="xl"
                  trailing-icon="i-lucide-arrow-right"
                  class="justify-between gap-4 lg:w-auto hidden lg:flex"
                  variant="outline"
                  color="neutral"
                >
                  {{ t('actions.view') }}
                </UButton>
              </div>
            </template>
          </UPageCard>
        </UPageGrid>
        <UPageCard
          v-if="newMembers && newMembers.length > 0"
          :ui="{
            wrapper: 'flex flex-col flex-1',
            header: 'mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between w-full',
          }"
        >
          <template #header>
            <div>New Members</div>
            <UButton
              to="/admin/users"
              variant="outline"
              color="neutral"
              size="xs"
              trailing-icon="i-lucide-arrow-right"
            >
              All Users
            </UButton>
          </template>
          <UTable
            :columns="newMembersTableColumns"
            :data="newMembers"
          />
        </UPageCard>
      </UPageBody>
    </UContainer>
  </div>
</template>
