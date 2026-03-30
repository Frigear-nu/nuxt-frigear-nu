<script setup lang="ts">
const [{ data: forms }] = await Promise.all([
  useAsyncData('forms', () => queryCollection('forms').all(), { default: () => [] }),
])
</script>

<template>
  <div>
    <UContainer class="flex flex-col gap-8">
      <UPageHeader
        title="Forms"
        :links="[{ label: 'Admin', to: $localePath('/admin'), icon: 'i-lucide-home' }]"
      />
      <UPageGrid v-if="forms && forms.length">
        <UPageCard
          v-for="form in forms"
          :key="form.id"
          :title="form.name"
          :description="form.title && $t(form.title)"
          :to="`/admin/forms${form.path}`"
        />
      </UPageGrid>
      <UEmpty
        v-else
        title="No forms yet!"
        description="You can create forms from the website studio"
        :actions="[{ label: 'Go to website studio', to: '/_studio', trailingIcon: 'i-lucide-arrow-right' }]"
      />
    </UContainer>
  </div>
</template>
