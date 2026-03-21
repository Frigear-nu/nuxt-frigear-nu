<script lang="ts" setup>
import useFormAsAdmin from '~/composables/admin/useFormAsAdmin'
import type { ButtonProps } from '@nuxt/ui'
import type { FormStep, SteppedForm as GenericSteppedForm } from '#shared/types/form'
import {
  boardMemberApplicationForm,
  projectApplicationForm,
  testApplicationForm,
} from '#shared/schema/forms/applications'
import { useSteppedForm } from '~/composables/useSteppedForm'
import { deriveFieldsFromSchema } from '#shared/form'

const route = useRoute()
const { $api } = useNuxtApp()
const { t } = useSiteI18n()
const submissionId = computed(() => route.params.submissionId)
const [{ data: form }, { data: submission }] = await Promise.all([
  useFormAsAdmin(),
  useAsyncData(() => `admin:forms:${route.path}:submission:${route.params.submissionId}`, async () => {
    return $api(`/api/admin/forms/submissions/${route.params.submissionId}`)
  }),
])

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

const stepped = useSteppedForm(steppedForm.value)

const filteredSteps = computed(() => {
  return stepped.allSteps.value.filter((step) => {
    return step.id !== 'info'
  })
})

//   :i18n-prefix="`form.${form.id}.${stepped.currentStepId.value}.${field.name}.`"
const translatedFieldLabel = (stepId: string, fieldName: string) => {
  const key = `form.${steppedForm.value.id}.${stepId}.${fieldName}.label`

  const translated = t(key)

  if (translated === key) {
    return fieldName
  }

  return translated
}

const headerLinks = computed<ButtonProps[]>(() => {
  return [
    { label: 'Back', to: `/admin/forms${form.value?.path}/submissions` },
  ]
})
</script>

<template>
  <UContainer>
    <UPageHeader
      :title="submissionId"
      :links="headerLinks"
    />
    <UPageList class="gap-4">
      <UPageCard
        v-for="(step) in filteredSteps"
        :key="step.id"
        :title="step.labelKey ? $t(step.labelKey) : step.id"
        :ui="{ title: 'text-xl' }"
      >
        <UPageList>
          <div
            v-if="submission && submission.data"
            class="grid grid-cols-2 gap-4"
          >
            <template
              v-for="(field, index) in deriveFieldsFromSchema(step.schema)"
              :key="`${step.id}:${field.name}`"
            >
              <div
                v-if="index < 12"
                class="flex flex-col gap-2 break-all"
              >
                <div class="text-md font-bold">
                  {{ translatedFieldLabel(step.id, field.name) }}
                </div>
                <div class="border border-muted rounded-lg p-1">
                  <div v-if="['text'].includes(field.type)">
                    {{ submission.data[field.name] }}
                  </div>
                  <div
                    v-else-if="field.type === 'textarea'"
                    class="whitespace-pre-wrap"
                  >
                    {{ submission.data[field.name] }}
                  </div>
                  <div
                    v-else-if="field.type === 'number'"
                    class="text-lg font-bold"
                  >
                    {{ submission.data[field.name] }}
                  </div>
                  <div v-else-if="field.type === 'checkbox'">
                    {{ submission.data[field.name] ? 'Yes' : 'No' }}
                  </div>
                  <div v-else-if="field.type ==='file'">
                    <AdminFormFieldFile
                      :file="submission.data[field.name]"
                      :submission="submission"
                      :field="field"
                      :step="step"
                    />
                  </div>
                  <div v-else>
                    {{ field.type }} :: {{ submission.data[field.name] }}
                  </div>
                </div>
              </div>
            </template>
          </div>
        </UPageList>
      </UPageCard>
    </UPageList>
  </UContainer>
</template>
