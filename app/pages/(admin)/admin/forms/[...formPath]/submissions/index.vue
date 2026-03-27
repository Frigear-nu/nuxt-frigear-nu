<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
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
  {
    label: 'Export all as PDF',
    icon: 'i-lucide-file-down',
    color: 'neutral',
    variant: 'outline',
    onClick: exportAllAsPdf,
  },
])

const submissionContentRefs = ref<(InstanceType<typeof AdminFormSubmissionContent> | null)[]>([])
const setSubmissionRef = (el: ComponentPublicInstance | null, index: number) => {
  submissionContentRefs.value[index] = el as InstanceType<typeof AdminFormSubmissionContent> | null
}

const exportAllAsPdf = async () => {
  if (!submissions.value?.length) return
  for (const [index, submission] of submissions.value.entries()) {
    const el = submissionContentRefs.value[index]?.$el
    if (!el) continue
    await exportToPDF(`submission-${submission.id}.pdf`, el)
  }
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
        v-for="(submission, index) in submissions"
        :key="submission.id"
        :title="submission.id"
        :to="`/admin/forms${withLeadingSlash(form.path)}/submissions/${submission.id}`"
      >
        <AdminFormSubmissionContent
          v-if="form"
          :ref="(el) => setSubmissionRef(el as ComponentPublicInstance | null, index)"
          :form="form"
          :submission="submission"
        />
      </UPageCard>
    </UPageList>
  </UContainer>
</template>
