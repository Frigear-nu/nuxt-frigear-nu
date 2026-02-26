import type { ZodType } from 'zod/v4'
import { z } from 'zod/v4'
import type { FormStep, SteppedForm, FormFieldDef } from './types/form'

export function defineSteppedForm<const TSteps extends FormStep[]>(
  form: { id: string, steps: TSteps },
) {
  return form as SteppedForm<TSteps>
}

export function deriveFieldsFromSchema(schema: ZodType): FormFieldDef[] {
  if (!(schema instanceof z.ZodObject)) return []

  return Object.entries(schema.shape).map(([name, fieldSchema]) => {
    const { type, title, description, placeholder, ...meta } = (fieldSchema as ZodType).meta?.() ?? {}
    return {
      name,
      type: type as FormFieldDef['type'],
      label: title,
      description,
      placeholder: placeholder as string | undefined,
      meta,
    }
  })
}

export function deriveSchemaFromSteppedForm<const TSteps extends FormStep[]>(form: SteppedForm<TSteps>) {
  // TODO: This might wanna be with z.extend?
  return form.steps.reduce((acc, step) => {
    return acc.extend(step.schema.shape)
  }, z.object({}))
}
