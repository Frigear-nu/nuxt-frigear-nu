import type { ZodType } from 'zod/v4'
import { z } from 'zod/v4'
import type { FormStep, SteppedForm, FormFieldDef } from './types/form'
import { kebabCase, upperFirst } from 'scule'

export function defineSteppedForm<const TSteps extends FormStep[]>(
  form: { id: string, steps: TSteps },
) {
  return form as SteppedForm<TSteps>
}
function unwrapSchema(schema: ZodType): { schema: ZodType, isArray: boolean } {
  if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable) {
    return unwrapSchema(schema.unwrap())
  }
  if (schema instanceof z.ZodDefault) {
    return unwrapSchema(schema._def.innerType)
  }
  if (schema instanceof z.ZodArray) {
    const { schema: inner } = unwrapSchema(schema.element)
    return { schema: inner, isArray: true }
  }
  // Take the first union member as the representative type
  if (schema instanceof z.ZodUnion) {
    return unwrapSchema(schema._def.options[0])
  }
  // z.coerce.number() / z.coerce.boolean() etc. wrap in ZodPipe
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
    const { schema: resolved, isArray } = unwrapSchema(fieldSchema as ZodType)

    const { type, title, description, placeholder, ...meta } = resolved.meta?.() ?? {}

    const finalType = fieldSchema.meta()?.type ?? type ?? TYPENAME_MAP[resolved.def.type] ?? resolved.def.type

    if (import.meta.dev) {
      console.log({ name, type: finalType, isArray, title, description, placeholder, meta })
    }
    return {
      name,
      type: finalType as FormFieldDef['type'],
      isArray,
      label: title || upperFirst(kebabCase(name).replace(/-/g, ' ')),
      description,
      placeholder: placeholder as string | undefined,
      meta: fieldSchema.meta?.() || meta,
    }
  })
}

export function deriveSchemaFromSteppedForm<const TSteps extends FormStep[]>(form: SteppedForm<TSteps>) {
  return form.steps.reduce((acc, step) => {
    // @ts-expect-error This is just weak typing...
    return acc.extend(step.schema.shape)
  }, z.object({}))
}
