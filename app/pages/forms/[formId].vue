<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import { kebabCase } from 'scule'
import { withLeadingSlash } from 'ufo'
import type { ProjectApplicationForm } from '#shared/schema/forms/applications'
import {
  projectApplicationForm,
  boardMemberApplicationForm,
  testApplicationForm,
} from '#shared/schema/forms/applications'

definePageMeta({
  // header: false,
  layout: 'form',
  footer: false,
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

const stepped = useTemplateRef('stepped')
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

  if (form.value.path === '/board-member-application') {
    return boardMemberApplicationForm
  }

  return testApplicationForm
})

const currentIndex = computed(() => stepped.value?.stepped.currentStepIndex.value)

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

const displayAlert = ref(false)
const alertToDisplay = ref<{ title: string, description: string, color?: string } | null>(null)

const resubmitForm = () => {
  const resubmit = form.value?.resubmittable
  stepped.value.stepped.goToStep(resubmit?.start || 0)

  // get the keys to carry over
  const keysToCarry = (resubmit?.fields || []).map(key => key.split('.').pop() || '').filter(Boolean)

  if (keysToCarry.length) {
    const allKeys = Object.keys(stepped.value.stepped.state)
    for (const key of allKeys) {
      if (!keysToCarry.includes(key)) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete stepped.value.stepped.state[key]
      }
    }
  }

  // TODO: Show the green alert if any
  if (resubmit && resubmit.alert) {
    alertToDisplay.value = resubmit.alert
    displayAlert.value = true
  }

  wasSubmitted.value = false
}

const completedFromActions = computed<ButtonProps[]>(() => {
  const items: ButtonProps[] = [{ label: 'Back home', to: localePath('/'), icon: 'i-lucide-arrow-left' }]

  if (form.value && form.value.resubmittable) {
    // check what steps and data
    items.push({
      label: 'Submit another',
      icon: 'i-lucide-play',
      onClick: resubmitForm,
    })
  }

  return items
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-center">
      <NuxtLink to="/">
        <NuxtImg
          src="/icon-192.png"
          class="size-14 rounded-full"
        />
      </NuxtLink>
    </div>
    <div
      v-if="form.title || form.description"
      class="flex flex-col gap-1 text-center mb-2"
    >
      <div class="text-2xl font-bold">
        {{ $t(form.title) }}
      </div>
      <div
        v-if="form.description && form.description !== $t(form.description)"
        class="text-md text-muted"
      >
        {{ $t(form.description) }}
      </div>
    </div>
    <UCard>
      <div
        v-if="steppedForm?.steps && steppedForm.steps.length > 1 && !wasSubmitted"
        class="flex justify-center gap-1 mb-8"
      >
        <div
          v-for="(_, index) in steppedForm.steps"
          :key="index"
          class="flex flex-col items-center"
        >
          <div
            :class="[
              'size-6 text-center rounded-3xl',
              index <= currentIndex ? 'bg-primary' : 'bg-neutral',
              index === currentIndex ? 'ring-1': '',
            ]"
          >
            {{ index + 1 }}
          </div>
          <!--          <UIcon -->
          <!--            v-if="step.icon" -->
          <!--            :name="step.icon" -->
          <!--          /> -->
        </div>
      </div>
      <UAlert
        v-if="displayAlert"
        v-bind="alertToDisplay"
        class="my-4"
        variant="subtle"
        close
        @update:open="displayAlert = false"
      />
      <FormStepped
        v-show="!wasSubmitted"
        ref="stepped"
        :form="steppedForm"
        @submit="onComplete"
      />
      <UEmpty
        v-show="wasSubmitted"
        title="Thanks!"
        icon="i-lucide-check"
        :actions="completedFromActions"
      />
    </UCard>
  </div>
</template>
