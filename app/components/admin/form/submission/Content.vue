<script lang="ts" setup>
import type { FormSubmission } from '@nuxthub/db/schema'
import type { FormStep, SteppedForm as GenericSteppedForm } from '#shared/types/form'
import {
  boardMemberApplicationForm,
  projectApplicationForm,
  testApplicationForm,
} from '#shared/schema/forms/applications'
import { useSteppedForm } from '~/composables/useSteppedForm'
import { deriveFieldsFromSchema } from '#shared/form'

const props = defineProps<{
  submission: FormSubmission
  form: { path: string }
  maxFieldsPerStep?: number
}>()

const MAX_FIELDS_PER_STEP = computed(() => props.maxFieldsPerStep ?? 12)

const { t } = useSiteI18n()

const steppedForm = computed<GenericSteppedForm<FormStep[]>>(() => {
  if (props.form?.path === '/project-application') {
    return projectApplicationForm as GenericSteppedForm<FormStep[]>
  }

  if (props.form?.path === '/board-member-application') {
    return boardMemberApplicationForm as GenericSteppedForm<FormStep[]>
  }

  return testApplicationForm as GenericSteppedForm<FormStep[]>
})

const stepped = useSteppedForm(steppedForm.value)

const filteredSteps = computed(() => {
  return stepped.allSteps.value.filter(step => step.id !== 'info')
})

const translatedFieldLabel = (stepId: string, fieldName: string) => {
  const key = `form.${steppedForm.value.id}.${stepId}.${fieldName}.label`
  const translated = t(key)

  if (translated === key) {
    return fieldName
  }

  return translated
}
</script>

<template>
  <UPageList
    v-if="submission && submission.data"
    class="gap-4"
  >
    <UPageCard
      v-for="step in filteredSteps"
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
              v-if="index < MAX_FIELDS_PER_STEP"
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
                <div
                  v-else-if="field.type === 'file'"
                  class="max-w-dvw"
                >
                  <AdminFormFieldFile
                    :file="submission.data[field.name]"
                    :submission="submission"
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
</template>
