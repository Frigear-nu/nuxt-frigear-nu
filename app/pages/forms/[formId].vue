<script setup lang="ts">
import { kebabCase } from 'scule'
import { withLeadingSlash } from 'ufo'
import { type ProjectApplicationForm, testApplicationForm } from '#shared/schema/forms/project-application'
import { projectApplicationForm } from '#shared/schema/forms/project-application'

definePageMeta({
  layout: 'form',
})

const { localePath } = useSiteI18n()
const route = useRoute()
const { $api } = useNuxtApp()

const formId = computed(() => route.params.formId as string)

const { data: form } = await useAsyncData(() => `form:${kebabCase(route.path)}`, async () => {
  return queryCollection('forms').path(withLeadingSlash(toValue(formId))).first()
})

if (!form.value) {
  throw createError({
    status: 404,
    message: 'Form not found',
  })
}

const wasSubmitted = ref(false)

// const title = computed(() => form.value?.title)
// const description = computed(() => form.value?.description)

const steppedForm = computed(() => {
  if (!form.value) {
    return undefined
  }

  if (form.value.path === '/project-application') {
    return projectApplicationForm
  }

  return testApplicationForm
})

// const fileUploader = useUpload(`/api/forms/${form.value.path}`)

const onComplete = async (args: ProjectApplicationForm) => {
  if (!form.value) {
    return
  }
  const formData = new FormData()

  // Append non-file fields
  for (const [key, value] of Object.entries(args)) {
    if (Array.isArray(value) && value[0] instanceof File) {
      // Append each file in attachment arrays
      value.forEach((file: File) => formData.append(key, file))
    }
    else if (value instanceof File) {
      formData.append(key, value)
    }
    else {
      formData.append(key, JSON.stringify(value))
    }
  }

  const submission = await $api(`/api/forms${form.value.path}`, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type — the browser sets it automatically
    // with the correct multipart/form-data boundary
  })

  if (submission && submission.id) {
    wasSubmitted.value = true
  }
}
</script>

<template>
  <div>
    <!--    <div class="flex flex-col gap-2"> -->
    <!--      <div>{{ title }}</div> -->
    <!--      <div>{{ description }}</div> -->
    <!--    </div> -->
    <FormStepped
      v-if="!wasSubmitted"
      :form="steppedForm"
      @submit="onComplete"
    />
    <UEmpty
      v-else
      title="Thanks!"
      icon="i-lucide-check"
      :actions="[{ label: 'Back home', to: localePath('/'), icon: 'i-lucide-arrow-left' }]"
    />
  </div>
</template>
