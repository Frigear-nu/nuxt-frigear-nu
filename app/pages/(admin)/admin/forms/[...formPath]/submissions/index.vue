<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import useFormAsAdmin from '~/composables/admin/useFormAsAdmin'
import { withLeadingSlash } from 'ufo'

const route = useRoute()
const { $api } = useNuxtApp()
const [{ data: form }, { data: submissions }] = await Promise.all([
  useFormAsAdmin(),
  useAsyncData(() => `admin:form:${route.path}:submissions`, async () => {
    return $api(`/api/admin/forms${withLeadingSlash(route.params.formPath.join('/'))}`)
  }),
])

const headerTitle = computed(() => {
  if (!form.value) {
    return 'n/a'
  }

  return `${form.value.name} submissions`
})

const headerLinks = computed<ButtonProps[]>(() => [
  {
    label: 'Start a new submission',
    to: `/forms${withLeadingSlash(form.value.path)}`,
  },
])

const getPreview = (submission: typeof submissions.value[0]) => {
  if (submission.data && typeof submission.data === 'object') {
    const { files: _, ...data } = submission.data
    return Object.values(data).map(v => typeof v === 'object' ? JSON.stringify(v) : v)
      .slice(0, 3)
  }

  return []
}
</script>

<template>
  <UContainer>
    <UPageHeader
      :title="headerTitle"
      :links="headerLinks"
    />
    <UPageList>
      <UPageCard
        v-for="submission in submissions"
        :key="submission.id"
        :title="submission.id"
        :to="`/admin/forms${withLeadingSlash(form.path)}/submissions/${submission.id}`"
      >
        <template #description>
          <b>Preview:</b><br>
          <div class="flex flex-col gap-0">
            <div
              v-for="item in getPreview(submission)"
              :key="item"
            >
              {{ item }}
            </div>
          </div>
        </template>
      </UPageCard>
    </UPageList>
  </UContainer>
</template>
