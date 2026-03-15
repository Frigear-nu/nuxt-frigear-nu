// --------------------------------- //
// app/composables/useSteppedForm.ts //
// --------------------------------- //

import type { UnionFormSteps, FormStep, SteppedForm } from '#shared/types/form'

export const useSteppedForm = <const TSteps extends FormStep[]>(
  form: SteppedForm<TSteps>,
) => {
  type UnionSteps = UnionFormSteps<TSteps>

  const state = reactive<Partial<UnionSteps>>({})

  const currentStepIndex = ref(0)

  const currentStep = computed(() => form.steps[currentStepIndex.value])
  const currentStepId = computed(() => currentStep.value?.id)
  const isFirstStep = computed(() => currentStepIndex.value === 0)
  const isLastStep = computed(() => currentStepIndex.value === form.steps.length - 1)
  const progress = computed(() => Math.round(((currentStepIndex.value + 1) / form.steps.length) * 100))

  const isSubmitting = ref(false)

  const goToStep = (indexOrId: number | TSteps[number]['id']) => {
    const idx = typeof indexOrId === 'number'
      ? indexOrId
      : form.steps.findIndex(s => s.id === indexOrId)
    currentStepIndex.value = Math.max(0, Math.min(idx, form.steps.length - 1))
  }

  const goNext = () => goToStep(currentStepIndex.value + 1)
  const goPrev = () => goToStep(currentStepIndex.value - 1)

  const createSubmitHandler = (onComplete: (data: UnionSteps) => Promise<void> | void) => {
    return async () => {
      const step = currentStep.value
      if (!step?.schema) return

      isSubmitting.value = true
      try {
        const { data: parsed, success } = await step.schema.safeParseAsync(state)
        if (!success) return

        Object.assign(state, parsed)

        if (isLastStep.value) {
          // await new Promise(resolve => setTimeout(resolve, 2500))
          await onComplete(state as UnionSteps)
        }
        else {
          goNext()
        }
      }
      finally {
        isSubmitting.value = false
      }
    }
  }

  return {
    state,
    isSubmitting,
    currentStep,
    currentStepId,
    currentStepIndex,
    isFirstStep,
    isLastStep,
    progress,
    goToStep,
    goNext,
    goPrev,
    createSubmitHandler,
  }
}
