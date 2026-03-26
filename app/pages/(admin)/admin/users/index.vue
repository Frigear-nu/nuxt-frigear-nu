<script setup lang="ts">
import { useAdminListUsers } from '~/store/queries/admin/users'

const { data: users } = await useAdminListUsers()
</script>

<template>
  <div>
    <UContainer class="flex flex-col gap-8">
      <UPageHeader
        title="Users"
        :links="[{ label: 'Admin', to: $localePath('/admin'), icon: 'i-lucide-home' }]"
      />
      <UPageGrid v-if="users && users.length">
        <UPageCard
          v-for="user in users"
          :key="user.id"
          :title="user.email"
          :description="user.name"
        />
      </UPageGrid>
      <UEmpty
        v-else
        title="No users yet!"
      />
    </UContainer>
  </div>
</template>
