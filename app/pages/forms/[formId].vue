// app/pages/forms[formId].vue
<script setup lang="ts">
import type { ButtonProps, AlertProps } from '@nuxt/ui'
import { kebabCase } from 'scule'
import { withLeadingSlash } from 'ufo'
import { useLocalStorage } from '@vueuse/core'
import type { FormStep, SteppedForm as GenericSteppedForm } from '#shared/types/form'
import {
  projectApplicationForm,
  boardMemberApplicationForm,
  testApplicationForm,
} from '#shared/schema/forms/applications'
import type { CollectionForm } from '#shared/schema/content-form'

type SteppedExpose = {
  stepped: {
    isSubmitting: { value: boolean }
    currentStepIndex: { value: number }
    state: Record<string, unknown>
    goToStep: (indexOrId: number | string) => void
  }
}

type ResubmittableConfig = Extract<
  CollectionForm['resubmittable'],
  Record<string, unknown>
>

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

const { data: form } = await useAsyncData(() => `form:${kebabCase(route.path)}`, async () => {
  return queryCollection('forms').path(withLeadingSlash(toValue(formId))).first()
})

if (!form.value) {
  throw createError({
    status: 404,
    message: t('form.notFound'),
  })
}

const stepped = useTemplateRef<SteppedExpose>('stepped')
const isLoading = computed(() => stepped.value?.stepped?.isSubmitting?.value)
const wasSubmitted = ref(false)

// Persist the draft submission ID in localStorage, keyed by form path
const draftSubmissionId = useLocalStorage<string | null>(
  `form_draft:${form.value.path}`,
  null,
)

// Restore draft state on mount if a draft submission ID is stored
onMounted(async () => {
  const draftId = draftSubmissionId.value
  if (!draftId || !stepped.value) return

  try {
    const draft = await $api<{ id: string, data: Record<string, unknown>, completedSteps: number }>(
      `/api/forms/submissions/${draftId}`,
    )
    if (draft && stepped.value) {
      Object.assign(stepped.value.stepped.state, draft.data)
      stepped.value.stepped.goToStep(draft.completedSteps)
    }
  }
  catch {
    // Draft not found or already submitted — clear the stale reference
    draftSubmissionId.value = null
  }
})

// const title = computed(() => form.value?.title)
// const description = computed(() => form.value?.description)

const steppedForm = computed<GenericSteppedForm<FormStep[]>>(() => {
  // TODO: remove when schema is inferred from yaml.
  if (form.value?.path === '/project-application') {
    return projectApplicationForm as GenericSteppedForm<FormStep[]>
  }

  if (form.value?.path === '/board-member-application') {
    return boardMemberApplicationForm as GenericSteppedForm<FormStep[]>
  }

  return testApplicationForm as GenericSteppedForm<FormStep[]>
})

const currentIndex = computed(() => stepped.value?.stepped.currentStepIndex.value ?? 0)

// const fileUploader = useUpload(`/api/forms/${form.value.path}`)

// Save each completed intermediate step as a draft in the DB
const onStepSave = async (_stepId: string, data: Record<string, unknown>, completedSteps: number) => {
  const path = form.value?.path
  if (!path) return

  // Exclude File objects — they cannot be JSON-serialised for draft storage
  const serialisableData = Object.fromEntries(
    Object.entries(data).filter(([, v]) => {
      if (v instanceof File) return false
      if (Array.isArray(v) && v.length > 0 && v[0] instanceof File) return false
      return true
    }),
  )

  try {
    const result = await $api<{ id: string }>(`/api/forms${path}`, {
      method: 'PUT',
      body: {
        submissionId: draftSubmissionId.value ?? undefined,
        data: serialisableData,
        completedSteps,
      },
    })

    if (result?.id) {
      draftSubmissionId.value = result.id
    }
  }
  catch {
    // Draft save failed — the form continues to advance; progress is not persisted
  }
}

const onComplete = async (args: Record<string, unknown>) => {
  const path = form.value?.path
  if (!path) {
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

  const submission = await $api<{ id?: string }>(`/api/forms${path}`, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type — the browser sets it automatically
    // with the correct multipart/form-data boundary
  })

  if (submission && submission.id) {
    draftSubmissionId.value = null
    wasSubmitted.value = true
  }
}

const displayAlert = ref(false)

const alertToDisplay = ref<AlertProps | null>(null)

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

const translatedFormTitle = computed(() => {
  return form.value?.title ? t(form.value.title) : ''
})

const translatedFormDescription = computed(() => {
  return form.value?.description ? t(form.value.description) : ''
})

const resubmitForm = () => {
  const resubmit = form.value?.resubmittable as ResubmittableConfig | undefined
  stepped.value?.stepped.goToStep(resubmit?.start || 0)

  // get the keys to carry over
  const keysToCarry = (resubmit?.fields || []).map(key => key.split('.').pop() || '').filter(Boolean)

  if (keysToCarry.length && stepped.value) {
    const allKeys = Object.keys(stepped.value.stepped.state)
    for (const key of allKeys) {
      if (!keysToCarry.includes(key)) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete stepped.value.stepped.state[key]
      }
    }
  }

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
    label: t('form.success.done'),
    to: localePath('/funding'),
    icon: 'i-lucide-x',
    variant: 'ghost',
  }]

  if (form.value && form.value.resubmittable) {
    items.push({
      label: t('form.success.sendAnother'),
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
      v-if="form && (form.title || form.description)"
      class="flex flex-col gap-1 text-center mb-2"
    >
      <div class="text-2xl font-bold">
        {{ translatedFormTitle }}
      </div>
      <div
        v-if="translatedFormDescription"
        class="text-md text-toned"
      >
        {{ translatedFormDescription }}
      </div>
    </div>
    <div class="gradient-linear-br-teal-purple">
      <UPageCard
        variant="outline"
        class="bg-transparent max-w-full h-auto max-h-fit"
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
          @step-complete="onStepSave"
        />
        <UEmpty
          v-show="wasSubmitted && !isLoading"
          :title="t('form.success.title')"
          icon="i-lucide-check"
          :actions="completedFormActions"
        />
      </UPageCard>
    </div>
  </div>
</template>
