<script generic="TSteps extends FormStep[]" lang="ts" setup>
import type { FormStep, SteppedForm, UnionFormSteps } from '#shared/types/form'
import { deriveFieldsFromSchema } from '#shared/form'
import { useSteppedForm } from '~/composables/useSteppedForm'

const props = defineProps<{
  form: SteppedForm<TSteps>
}>()

const emit = defineEmits<{
  submit: [data: UnionFormSteps<TSteps>]
}>()

const formEl = useTemplateRef('formEl')
const stepped = useSteppedForm(props.form)
const onSubmit = stepped.createSubmitHandler(data => emit('submit', data))

const currentFields = computed(() => {
  const step = stepped.currentStep.value
  if (!step) return []
  if (step.fields?.length) return step.fields
  return deriveFieldsFromSchema(step.schema)
})

const submit = () => {
  formEl.value?.submit()
}

// const validate = (state: Partial<UnionFormSteps<TSteps>>) => {
//   const errors = []
//   // Inject custom messages?
//
//   return errors
// }

defineExpose({
  stepped,
  form: formEl,
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex justify-between">
      <h1
        v-if="stepped.currentStep.value?.labelKey"
        class="text-lg"
      >
        <MDC
          :value="$t(stepped.currentStep.value.labelKey)"
          unwrap
        />
      </h1>
      <UModal
        v-if="stepped.currentStep.value?.info"
        title="Info"
        :ui="{ footer: 'justify-end' }"
      >
        <UButton
          :icon="stepped.currentStep.value?.info?.icon || 'i-lucide-info'"
          variant="ghost"
        />
        <template #body>
          <MDC
            :value="typeof stepped.currentStep.value?.info === 'string' ? stepped.currentStep.value.info : stepped.currentStep.value.info.content"
            unwrap
          />
        </template>
        <template #footer="{ close }">
          <UButton
            label="Close"
            @click="close"
          />
        </template>
      </UModal>
    </div>

    <UForm
      ref="formEl"
      :schema="stepped.currentStep.value?.schema"
      :state="stepped.state"
      class="flex flex-col gap-4"
      loading-auto
      @submit="onSubmit"
    >
      <template v-if="currentFields.length">
        <FormStepFieldRenderer
          v-for="field in currentFields"
          :key="field.name"
          :field="field"
          :state="stepped.state"
          :i18n-prefix="`form.${form.id}.${stepped.currentStepId.value}.${field.name}.`"
          @update:state="(name, value) => { (stepped.state as Record<string, unknown>)[name] = value }"
        />
      </template>
      <template v-else>
        <slot
          :name="`step-${stepped.currentStepId.value}`"
          :state="stepped.state"
        />
      </template>

      <!-- Navigation -->
      <div class="flex items-center justify-between pt-2">
        <slot
          name="back-button"
          :is-first-step="stepped.isFirstStep.value"
          :go-previous="stepped.goPrev"
        >
          <UButton
            v-if="!stepped.isFirstStep.value"
            variant="ghost"
            icon="i-lucide-arrow-left"
            type="button"
            :label="$t('steppedForm.previous')"
            @click="stepped.goPrev"
          />
          <span v-else />
        </slot>

        <slot
          name="next-button"
          :is-last-step="stepped.isLastStep.value"
          :is-submitting="stepped.isSubmitting.value"
          :submit="submit"
        >
          <UButton
            type="submit"
            :loading="stepped.isSubmitting.value"
            :trailing-icon="stepped.isLastStep.value ? 'i-lucide-send' : 'i-lucide-arrow-right'"
            :label="stepped.isLastStep.value ? $t('steppedForm.submit') : $t('steppedForm.next')"
          />
        </slot>
      </div>
    </UForm>
  </div>
</template>
