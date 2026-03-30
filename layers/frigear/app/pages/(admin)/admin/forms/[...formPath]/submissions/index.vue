<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import useFormAsAdmin from '~/composables/admin/useFormAsAdmin'
import { withLeadingSlash } from 'ufo'
import { objectGet } from '#shared/object'
import { upperFirst } from 'scule'

const route = useRoute()
const { $api } = useNuxtApp()
const { t } = useSiteI18n()
const [{ data: form }, { data: submissions }] = await Promise.all([
  useFormAsAdmin(),
  useAsyncData(() => `admin:form:${route.path}:submissions`, async () => {
    return $api(`/api/admin/forms${withLeadingSlash(route.params.formPath?.join('/'))}`)
  }, { watch: [() => route.path] }),
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

const getPreview = (submission: typeof submissions.value[number]) => {
  if (form.value && form.value.preview) {
    // some forms have steps... so we need to flatten the keys:
    return Object.fromEntries(form.value.preview.map((key) => {
      return [key, objectGet(submission.data || {}, key.includes('.') ? key.split('.').slice(-1)[0] : key)]
    }))
  }
  if (submission.data && typeof submission.data === 'object') {
    const { files: _, ...data } = submission.data
    return Object.fromEntries(Object.keys(data).slice(0, 3).map(key => [key, objectGet(submission.data || {}, key)]))
  }

  return {}
}

const translationKey = (key: string) => {
  let prefix = `form.${form.value?.name}`
  // TODO: this should follow the form...
  if (form.value && form.value.name === 'project-application') {
    prefix = 'form.application'
  }

  const translateKey = `${prefix}.${key}.label`
  const translated = t(translateKey)

  if (translated !== translateKey) {
    return translated
  }

  return key.split('.').slice(-1)[0].split('_').map(upperFirst).join(' ')
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
          <div class="flex flex-col gap-0">
            <div
              v-for="(value, key) in getPreview(submission)"
              :key="key"
            >
              <b>{{ translationKey(key) }}</b>: {{ value || 'n/a' }}
            </div>
          </div>
        </template>
      </UPageCard>
    </UPageList>
  </UContainer>
</template>
