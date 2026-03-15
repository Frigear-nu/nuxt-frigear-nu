// app/pages/forms[formId].vue
<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import { kebabCase } from 'scule'
import { withLeadingSlash } from 'ufo'
import type { ProjectApplicationForm } from '#shared/schema/forms/applications'
import type { FormStep, SteppedForm as GenericSteppedForm } from '#shared/types/form'
import {
  projectApplicationForm,
  boardMemberApplicationForm,
  testApplicationForm,
} from '#shared/schema/forms/applications'

import type {
  AlertColor,
  ResubmittableConfig,
  FormContentDoc,
  FormSubmissionResponse,
} from '#shared/types/forms-content'

type SteppedExpose = {
  stepped: {
    isSubmitting: { value: boolean }
    currentStepIndex: { value: number }
    state: Record<string, unknown>
    goToStep: (indexOrId: number | string) => void
  }
}

definePageMeta({
  header: true,
  layout: 'form',
  footer: true,
})

const { localePath, t } = useSiteI18n()
const route = useRoute()
const { $api } = useNuxtApp()
const { translatedProperty } = useContent()

const formId = computed(() => route.params.formId as string)

const { data: form } = await useAsyncData<FormContentDoc | null>(() => `form:${kebabCase(route.path)}`, async () => {
  return await queryCollection('forms').path(withLeadingSlash(toValue(formId))).first() as FormContentDoc | null
})

if (!form.value) {
  throw createError({
    statusCode: 404,
    statusMessage: t('form.notFound'),
  })
}

const formDoc = computed<FormContentDoc>(() => form.value as FormContentDoc)

const stepped = useTemplateRef<SteppedExpose>('stepped')
const isLoading = computed(() => stepped.value?.stepped.isSubmitting.value ?? false)
const wasSubmitted = ref(false)

// const title = computed(() => form.value?.title)
// const description = computed(() => form.value?.description)

const steppedForm = computed<GenericSteppedForm<FormStep[]>>(() => {
  if (formDoc.value.path === '/project-application') {
    return projectApplicationForm as GenericSteppedForm<FormStep[]>
  }

  if (formDoc.value.path === '/board-member-application') {
    return boardMemberApplicationForm as GenericSteppedForm<FormStep[]>
  }

  return testApplicationForm as GenericSteppedForm<FormStep[]>
})

const currentIndex = computed(() => stepped.value?.stepped.currentStepIndex.value ?? 0)

// const fileUploader = useUpload(`/api/forms/${form.value.path}`)

const onCompleteProjectApplication = async (args: ProjectApplicationForm) => {
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

  const submission = await $api<FormSubmissionResponse>(`/api/forms${formDoc.value.path}`, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type — the browser sets it automatically
    // with the correct multipart/form-data boundary
  })

  if (submission && submission.id) {
    wasSubmitted.value = true
  }
}

const onComplete = async (args: Record<string, unknown>) => {
  await onCompleteProjectApplication(args as ProjectApplicationForm)
}

const displayAlert = ref(false)

const alertToDisplay = ref<{ title: string, description: string, color?: AlertColor } | null>(null)

const translatedAlert = computed(() => {
  if (!alertToDisplay.value) {
    return null
  }

  return {
    ...alertToDisplay.value,
    title: translatedProperty(alertToDisplay.value.title),
    description: translatedProperty(alertToDisplay.value.description),
  }
})

const resubmittableConfig = computed<ResubmittableConfig | null>(() => {
  const resubmit = formDoc.value.resubmittable
  return resubmit && typeof resubmit === 'object' ? resubmit : null
})

const translatedFormTitle = computed(() => {
  return formDoc.value.title ? $t(formDoc.value.title) : ''
})

const translatedFormDescription = computed(() => {
  return formDoc.value.description ? $t(formDoc.value.description) : ''
})

const resubmitForm = () => {
  const resubmit = resubmittableConfig.value
  stepped.value?.stepped.goToStep(resubmit?.start || 0)

  // get the keys to carry over
  const keysToCarry = (resubmit?.fields ?? [])
    .map((key: string) => key.split('.').pop() || '')
    .filter(Boolean)

  if (keysToCarry.length && stepped.value) {
    const allKeys = Object.keys(stepped.value.stepped.state)
    for (const key of allKeys) {
      if (!keysToCarry.includes(key)) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete stepped.value.stepped.state[key]
      }
    }
  }

  // TODO: Show the green alert if any
  if (resubmit?.alert) {
    alertToDisplay.value = resubmit.alert
    displayAlert.value = true

    setTimeout(() => {
      displayAlert.value = false
      alertToDisplay.value = null
    }, 15000)
  }

  wasSubmitted.value = false
}

const completedFormActions = computed<ButtonProps[]>(() => {
  const items: ButtonProps[] = [{
    label: $t('form.success.done'),
    to: localePath('/funding'),
    icon: 'i-lucide-x',
    variant: 'ghost',
  }]

  if (resubmittableConfig.value) {
    items.push({
      label: $t('form.success.sendAnother'),
      icon: 'i-lucide-play',
      variant: 'subtle',
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
        <UAvatar
          src="/images/branding/logos/circular/frigear-bullhorn-icon-18a841-l-green-darkgreen-shadow-1500x1500-circle-friendly.png"
          size="xl"
          class=""
        />
      </NuxtLink>
    </div>
    <div
      v-if="formDoc.title || formDoc.description"
      class="flex flex-col gap-1 text-center mb-2"
    >
      <div class="text-2xl font-bold">
        {{ translatedFormTitle }}
      </div>
      <div
        v-if="formDoc.description && formDoc.description !== translatedFormDescription"
        class="text-md text-toned"
      >
        {{ translatedFormDescription }}
      </div>
    </div>
    <UCard
      variant="outline"
      spotlight="true"
      class="gradient-linear-br-teal-purple max-w-full h-auto max-h-fit"
    >
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
        v-bind="translatedAlert"
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
        v-show="wasSubmitted && !isLoading"
        :title="$t('form.success.title')"
        icon="i-lucide-check"
        :actions="completedFormActions"
      />
    </UCard>
  </div>
</template>
