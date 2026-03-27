<script lang="ts" setup>
import useFormAsAdmin from '~/composables/admin/useFormAsAdmin'
import type { ButtonProps } from '@nuxt/ui'

const route = useRoute()
const { $api } = useNuxtApp()
const submissionId = computed(() => route.params.submissionId as string)
const [{ data: form }, { data: submission }] = await Promise.all([
  useFormAsAdmin(),
  useAsyncData(() => `admin:forms:${route.path}:submission:${route.params.submissionId}`, async () => {
    return $api(`/api/admin/forms/submissions/${route.params.submissionId}`)
  }, { watch: [submissionId, () => route.path] }),
])

const headerLinks = computed<ButtonProps[]>(() => {
  return [
    { label: 'Back', to: `/admin/forms${form.value?.path}/submissions` },
    { label: 'Export as PDF', icon: 'i-lucide-file-down', color: 'neutral', variant: 'outline', onClick: exportAsPdf },
  ]
})

const submissionContentRef = ref<InstanceType<typeof AdminFormSubmissionContent> | null>(null)
const exportAsPdf = () => {
  const el = submissionContentRef.value?.$el
  if (el) {
    exportToPDF(`submission-${submissionId.value}.pdf`, el)
  }
}
</script>

<template>
  <UContainer>
    <UPageHeader
      :title="submissionId"
      :links="headerLinks"
      :ui="{
        title: 'truncate',
      }"
    />
    <AdminFormSubmissionContent
      v-if="form && submission"
      ref="submissionContentRef"
      :form="form"
      :submission="submission"
    />
  </UContainer>
</template>
