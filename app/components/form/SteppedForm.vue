<script setup lang="ts">
import { reactive, ref, computed, nextTick, toRaw } from 'vue'
import type { SteppedForm } from '#shared/schema/forms/project-application'

const props = defineProps<{ form: SteppedForm }>()
const { t } = useSiteI18n()
const stepper = useTemplateRef('stepper')
const currentStepIndex = ref(0)
const state = reactive<Record<string, any>>({})

const $emits = defineEmits<{
  (e: 'submit', data: Record<string, any>): void
  (e: 'error', stepId: string, errors: any): void
}>()
const forms = new Map<string, any>()

const stepperItems = computed(() =>
  props.form.sections.map((section, index) => ({
    ...section,
    title: section.labelKey ? t(section.labelKey) : undefined,
    description: section.descriptionKey ? t(section.descriptionKey) : undefined,
    index,
  })),
)

const currentStep = computed(() => stepperItems.value[currentStepIndex.value])

const pendingResolvers = new Map<string, (val: boolean) => void>()

const setFormRef = (stepId: string) => (el: any) => {
  if (el) {
    forms.set(stepId, el)
  }
  else {
    forms.delete(stepId)
  }
}

const handleStepSubmit = (stepId: string, data: any) => {
  console.log('handleStepSubmit called for:', stepId, data)
  state[stepId] = data
  if (pendingResolvers.has(stepId)) {
    pendingResolvers.get(stepId)!(true)
    pendingResolvers.delete(stepId)
  }
}

const handleValidationError = (stepId: string, errors: any) => {
  console.log('Validation errors for:', stepId, errors)
  $emits('error', stepId, errors)
  if (pendingResolvers.has(stepId)) {
    pendingResolvers.get(stepId)!(false)
    pendingResolvers.delete(stepId)
  }
}

// Generate a unique key that includes whether state exists
const getFormKey = (itemId: string) => {
  const hasState = !!state[itemId]
  return `form-${itemId}-${hasState ? 'with-data' : 'empty'}-${currentStepIndex.value}`
}

const onNextSection = async () => {
  const stepId = currentStep.value.id
  const formInstance = forms.get(stepId)

  if (!formInstance) {
    console.error(`Form instance not found for step: ${stepId}`)
    return
  }

  const success = await new Promise<boolean>((resolve) => {
    pendingResolvers.set(stepId, resolve)

    try {
      formInstance.submit()
    }
    catch (error) {
      console.error('Error calling submit:', error)
      resolve(false)
    }

    setTimeout(() => {
      if (pendingResolvers.has(stepId)) {
        console.warn('Timeout: form did not emit submit event - likely validation failure')
        pendingResolvers.delete(stepId)
        resolve(false)
      }
    }, 100)
  })

  if (success) {
    await nextTick()
    stepper.value?.next()
  }
  else {
    console.log('Form validation failed, staying on current step')
  }
}

const onPreviousSection = () => {
  stepper.value?.prev()
}

const handleSubmitForm = () => {
  $emits('submit', toRaw(state))
}
</script>

<template>
  <div class="w-full">
    <UStepper
      ref="stepper"
      v-model="currentStepIndex"
      :items="stepperItems"
    >
      <template #content="{ item }">
        <div class="flex flex-col gap-4">
          <AutoForm
            :key="getFormKey(item.id)"
            :ref="setFormRef(item.id)"
            :schema="item.schema as never"
            :initial-values="state[item.id]"
            :config="{ submit: false, theme: { wFull: true } }"
            @submit="(data) => handleStepSubmit(item.id, data)"
            @error="(errors) => handleValidationError(item.id, errors)"
          >
            <template
              v-for="(_, slotName) in $slots"
              #[slotName]="slotProps"
            >
              <slot
                :name="slotName"
                v-bind="slotProps ?? {}"
              />
            </template>
          </AutoForm>
        </div>
      </template>
    </UStepper>

    <div class="flex gap-2 justify-between mt-4">
      <UButton
        :disabled="currentStepIndex === 0"
        @click="onPreviousSection"
      >
        Prev
      </UButton>
      <UButton
        v-if="currentStepIndex < stepperItems.length - 1"
        @click="onNextSection"
      >
        Next
      </UButton>
      <UButton
        v-else
        color="primary"
        @click="handleSubmitForm"
      >
        Submit
      </UButton>
    </div>
  </div>
</template>
