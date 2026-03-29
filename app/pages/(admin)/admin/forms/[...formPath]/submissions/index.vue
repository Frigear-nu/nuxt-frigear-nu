<script setup lang="ts">
import { createVNode, render } from 'vue'
import type { ButtonProps } from '@nuxt/ui'
import useFormAsAdmin from '~/composables/admin/useFormAsAdmin'
import { withLeadingSlash } from 'ufo'
import AdminFormSubmissionContent from '~/components/admin/form/submission/Content.vue'

const route = useRoute()
const { $api, vueApp } = useNuxtApp()
const toast = useToast()
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

const exportSubmissionAsPdf = async (submission: NonNullable<typeof submissions.value>[0]) => {
  if (!form.value) return

  const container = document.createElement('div')
  container.style.cssText = 'position:absolute;left:-9999px;top:0;width:800px;'

  try {
    document.body.appendChild(container)
    const vnode = createVNode(AdminFormSubmissionContent, { submission, form: form.value })
    vnode.appContext = vueApp._context
    render(vnode, container)
    await nextTick()
    await exportToPDF(`submission-${submission.id}.pdf`, container)
  }
  catch (err) {
    console.error(`Failed to export submission ${submission.id}:`, err)
    toast.add({ title: `Failed to export submission ${submission.id}`, description: err instanceof Error ? err.message : String(err), color: 'error' })
  }
  finally {
    render(null, container)
    container.parentNode?.removeChild(container)
  }
}

const exportAllAsPdf = async () => {
  if (!submissions.value?.length) return
  for (const submission of submissions.value) {
    await exportSubmissionAsPdf(submission)
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
        v-for="submission in submissions"
        :key="submission.id"
        :title="submission.id"
        :to="`/admin/forms${withLeadingSlash(form.path)}/submissions/${submission.id}`"
      />
    </UPageList>
  </UContainer>
</template>
