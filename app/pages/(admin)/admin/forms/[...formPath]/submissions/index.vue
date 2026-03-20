<script setup lang="ts">
import useFormAsAdmin from '~/composables/admin/useFormAsAdmin'

const { data: form } = await useFormAsAdmin()
</script>

<template>
  <UContainer>
    <UPageHeader title="Submissions" />
    <UCard>
      <pre>{{ form }}</pre>
    </UCard>
  </UContainer>
</template>
