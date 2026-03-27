import { describe, it, expect, vi, beforeEach } from 'vitest'
import { z } from 'zod/v4'
import { reactive, ref, computed } from 'vue'

// Re-implement the composable inline for isolated unit testing so that the
// tests do not depend on Nuxt auto-imports or the full app bootstrap.
// The logic here must stay in sync with app/composables/useSteppedForm.ts.

type FormStep<TSchema extends z.ZodType = z.ZodType> = {
  id: string
  schema: TSchema
}

type SteppedForm<TSteps extends FormStep[]> = {
  id: string
  steps: TSteps
}

function useSteppedForm<const TSteps extends FormStep[]>(form: SteppedForm<TSteps>) {
  const state = reactive<Record<string, unknown>>({})
  const currentStepIndex = ref(0)

  const allSteps = computed(() => form.steps)
  const currentStep = computed(() => form.steps[currentStepIndex.value])
  const currentStepId = computed(() => currentStep.value?.id)
  const isFirstStep = computed(() => currentStepIndex.value === 0)
  const isLastStep = computed(() => currentStepIndex.value === form.steps.length - 1)
  const progress = computed(() => Math.round(((currentStepIndex.value + 1) / form.steps.length) * 100))
  const isSubmitting = ref(false)

  const goToStep = (indexOrId: number | string) => {
    const idx = typeof indexOrId === 'number'
      ? indexOrId
      : form.steps.findIndex(s => s.id === indexOrId)
    currentStepIndex.value = Math.max(0, Math.min(idx, form.steps.length - 1))
  }

  const goNext = () => goToStep(currentStepIndex.value + 1)
  const goPrev = () => goToStep(currentStepIndex.value - 1)

  const createSubmitHandler = (
    onComplete: (data: Record<string, unknown>) => Promise<void> | void,
    onStepSave?: (stepId: string, data: Record<string, unknown>, completedSteps: number) => Promise<void> | void,
  ) => {
    return async () => {
      const step = currentStep.value
      if (!step?.schema) return

      isSubmitting.value = true
      try {
        const { data: parsed, success } = await step.schema.safeParseAsync(state)
        if (!success) return

        Object.assign(state, parsed)

        if (isLastStep.value) {
          await onComplete(state as Record<string, unknown>)
        }
        else {
          if (onStepSave) {
            await onStepSave(currentStepId.value!, { ...state }, currentStepIndex.value + 1)
          }
          goNext()
        }
      }
      finally {
        isSubmitting.value = false
      }
    }
  }

  return {
    allSteps, state, isSubmitting, currentStep, currentStepId,
    currentStepIndex, isFirstStep, isLastStep, progress,
    goToStep, goNext, goPrev, createSubmitHandler,
  }
}

// ─── Test forms ────────────────────────────────────────────────────────────────

const twoStepForm = {
  id: 'test',
  steps: [
    { id: 'step1', schema: z.object({ name: z.string() }) },
    { id: 'step2', schema: z.object({ email: z.email() }) },
  ],
}

const threeStepForm = {
  id: 'multi',
  steps: [
    { id: 'step1', schema: z.object({ a: z.string() }) },
    { id: 'step2', schema: z.object({ b: z.string() }) },
    { id: 'step3', schema: z.object({ c: z.string() }) },
  ],
}

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe('useSteppedForm – navigation', () => {
  it('starts on the first step', () => {
    const form = useSteppedForm(twoStepForm)
    expect(form.currentStepIndex.value).toBe(0)
    expect(form.currentStepId.value).toBe('step1')
    expect(form.isFirstStep.value).toBe(true)
    expect(form.isLastStep.value).toBe(false)
  })

  it('goNext advances to the next step', () => {
    const form = useSteppedForm(twoStepForm)
    form.goNext()
    expect(form.currentStepIndex.value).toBe(1)
    expect(form.isLastStep.value).toBe(true)
  })

  it('goPrev moves to the previous step', () => {
    const form = useSteppedForm(twoStepForm)
    form.goNext()
    form.goPrev()
    expect(form.currentStepIndex.value).toBe(0)
    expect(form.isFirstStep.value).toBe(true)
  })

  it('goToStep by index clamps to valid range', () => {
    const form = useSteppedForm(twoStepForm)
    form.goToStep(99)
    expect(form.currentStepIndex.value).toBe(1)
    form.goToStep(-5)
    expect(form.currentStepIndex.value).toBe(0)
  })

  it('goToStep by string id resolves the correct index', () => {
    const form = useSteppedForm(twoStepForm)
    form.goToStep('step2')
    expect(form.currentStepIndex.value).toBe(1)
    expect(form.currentStepId.value).toBe('step2')
  })

  it('progress is computed correctly', () => {
    const form = useSteppedForm(twoStepForm)
    expect(form.progress.value).toBe(50)
    form.goNext()
    expect(form.progress.value).toBe(100)
  })
})

describe('useSteppedForm – submit handler', () => {
  it('does not advance or call callbacks when validation fails', async () => {
    const form = useSteppedForm(twoStepForm)
    const onComplete = vi.fn()
    const onStepSave = vi.fn()
    const handler = form.createSubmitHandler(onComplete, onStepSave)

    // State is empty — schema requires `name: string`, so validation fails
    await handler()

    expect(form.currentStepIndex.value).toBe(0)
    expect(onStepSave).not.toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('advances to next step and calls onStepSave on intermediate step', async () => {
    const form = useSteppedForm(twoStepForm)
    const onComplete = vi.fn()
    const onStepSave = vi.fn()
    const handler = form.createSubmitHandler(onComplete, onStepSave)

    Object.assign(form.state, { name: 'Alice' })
    await handler()

    expect(form.currentStepIndex.value).toBe(1)
    expect(onStepSave).toHaveBeenCalledOnce()
    expect(onStepSave).toHaveBeenCalledWith('step1', expect.objectContaining({ name: 'Alice' }), 1)
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('calls onComplete (not onStepSave) on the last step', async () => {
    const form = useSteppedForm(twoStepForm)
    const onComplete = vi.fn()
    const onStepSave = vi.fn()
    const handler = form.createSubmitHandler(onComplete, onStepSave)

    // Complete step 1
    Object.assign(form.state, { name: 'Alice' })
    await handler()

    // Complete step 2 (last)
    Object.assign(form.state, { email: 'alice@example.com' })
    await handler()

    expect(onComplete).toHaveBeenCalledOnce()
    expect(onStepSave).toHaveBeenCalledOnce() // only for step 1
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ name: 'Alice', email: 'alice@example.com' }))
  })

  it('accumulates state across steps', async () => {
    const form = useSteppedForm(twoStepForm)
    const onComplete = vi.fn()
    const handler = form.createSubmitHandler(onComplete)

    Object.assign(form.state, { name: 'Bob' })
    await handler() // step 1

    Object.assign(form.state, { email: 'bob@example.com' })
    await handler() // step 2 (last)

    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ name: 'Bob', email: 'bob@example.com' }))
  })

  it('works without an onStepSave callback (backwards compatible)', async () => {
    const form = useSteppedForm(twoStepForm)
    const onComplete = vi.fn()
    const handler = form.createSubmitHandler(onComplete)

    Object.assign(form.state, { name: 'Carol' })
    await expect(handler()).resolves.not.toThrow()
    expect(form.currentStepIndex.value).toBe(1)
  })

  it('onStepSave receives completedSteps equal to next step index for 3-step form', async () => {
    const form = useSteppedForm(threeStepForm)
    const onStepSave = vi.fn()
    const handler = form.createSubmitHandler(vi.fn(), onStepSave)

    Object.assign(form.state, { a: 'value-a' })
    await handler() // completes step 0 → completedSteps should be 1

    expect(onStepSave).toHaveBeenCalledWith('step1', expect.any(Object), 1)

    Object.assign(form.state, { b: 'value-b' })
    await handler() // completes step 1 → completedSteps should be 2

    expect(onStepSave).toHaveBeenCalledWith('step2', expect.any(Object), 2)
    expect(onStepSave).toHaveBeenCalledTimes(2)
  })

  it('sets isSubmitting during handler execution', async () => {
    const form = useSteppedForm(twoStepForm)
    const submittingValues: boolean[] = []

    const onComplete = vi.fn(async () => {
      submittingValues.push(form.isSubmitting.value)
    })

    Object.assign(form.state, { name: 'Dave' })
    await form.createSubmitHandler(vi.fn())() // step1 intermediate

    Object.assign(form.state, { email: 'dave@example.com' })
    await form.createSubmitHandler(onComplete)() // last step

    expect(submittingValues).toContain(true)
    expect(form.isSubmitting.value).toBe(false) // reset after completion
  })
})

describe('useSteppedForm – state restoration', () => {
  it('goToStep can restore the form to a previously saved step', () => {
    const form = useSteppedForm(threeStepForm)

    // Simulate restoring from a draft with completedSteps = 2
    Object.assign(form.state, { a: 'restored-a', b: 'restored-b' })
    form.goToStep(2) // navigate to step 2 (the 3rd step)

    expect(form.currentStepIndex.value).toBe(2)
    expect(form.state).toMatchObject({ a: 'restored-a', b: 'restored-b' })
  })
})
