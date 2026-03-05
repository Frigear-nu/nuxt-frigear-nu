import type { ZodType } from 'zod/v4'
import { z } from 'zod/v4'
import type { FormStep, SteppedForm, FormFieldDef } from './types/form'
import { defu } from 'defu'

export function defineSteppedForm<const TSteps extends FormStep[]>(
  form: { id: string, steps: TSteps },
) {
  return form as SteppedForm<TSteps>
}
function unwrapSchema(schema: ZodType): { schema: ZodType, isArray: boolean, repeatable?: boolean } {
  if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable) {
    return unwrapSchema(schema.unwrap())
  }
  if (schema instanceof z.ZodDefault) {
    return unwrapSchema(schema._def.innerType)
  }
  if (schema instanceof z.ZodArray) {
    const meta = schema.meta?.()
    const isRepeatable = meta?.repeatable === true
    const { schema: inner } = unwrapSchema(schema.element)
    return { schema: inner, isArray: true, repeatable: isRepeatable }
  }
  if (schema instanceof z.ZodUnion) {
    return unwrapSchema(schema._def.options[0])
  }
  if (schema instanceof z.ZodPipe) {
    return unwrapSchema(schema._def.out)
  }
  return { schema, isArray: false }
}

const TYPENAME_MAP: Partial<Record<string, FormFieldDef['type']>> = {
  string: 'text',
  number: 'number',
  boolean: 'checkbox',
  date: 'date',
  enum: 'select',
  file: 'file',
}

export function deriveFieldsFromSchema(schema: ZodType): FormFieldDef[] {
  if (!(schema instanceof z.ZodObject)) return []

  return Object.entries(schema.shape).map(([name, fieldSchema]) => {
    const { schema: resolved, isArray, repeatable } = unwrapSchema(fieldSchema as ZodType)

    const { type, title, description, placeholder, ...meta } = defu(fieldSchema?.meta?.(), resolved.meta?.())

    const finalType = fieldSchema.meta()?.type ?? type ?? TYPENAME_MAP[resolved.def.type] ?? resolved.def.type

    if (import.meta.dev) {
      console.log({ name, type: finalType, isArray, title, description, placeholder, meta, repeatable })
    }

    return {
      name,
      type: finalType as FormFieldDef['type'],
      isArray,
      repeatable: repeatable || resolved?.meta?.()?.repeatable,
      // NEW: derive sub-fields when the inner schema is an object
      fields: (repeatable && resolved instanceof z.ZodObject)
        ? deriveFieldsFromSchema(resolved)
        : undefined,
      label: title,
      description,
      placeholder: placeholder as string | undefined,
      meta,
    }
  })
}

export function deriveSchemaFromSteppedForm<const TSteps extends FormStep[]>(form: SteppedForm<TSteps>) {
  return form.steps.reduce((acc, step) => {
    // @ts-expect-error This is just weak typing...
    return acc.extend(step.schema.shape)
  }, z.object({}))
}
