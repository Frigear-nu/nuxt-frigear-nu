// ---------------//
// shared/form.ts //
// ---------------//

import type { ZodType } from 'zod/v4'
import { z } from 'zod/v4'
import type { FormStep, SteppedForm, FormFieldDef } from './types/form'
import { defu } from 'defu'

export function defineSteppedForm<const TSteps extends FormStep[]>(
  form: { id: string, steps: TSteps },
) {
  return form as SteppedForm<TSteps>
}
function isSchemaOptional(schema: ZodType): boolean {
  if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable) {
    return true
  }
  if (schema instanceof z.ZodDefault) {
    return true
  }
  if (schema instanceof z.ZodPipe) {
    return isSchemaOptional(schema._zod.def.in)
  }
  return false
}

function unwrapSchema(schema: ZodType): { schema: ZodType, isArray: boolean } {
  // Strip optionality/nullability wrappers
  if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable) {
    return unwrapSchema(schema.unwrap())
  }
  // Strip defaults — field can be omitted, so walk the inner type
  if (schema instanceof z.ZodDefault) {
    return unwrapSchema(schema._zod.def.innerType)
  }
  // Unwrap arrays, recursing into the element type
  if (schema instanceof z.ZodArray) {
    const { schema: inner } = unwrapSchema(schema.element)
    return { schema: inner, isArray: true }
  }
  // Take the first union member as representative
  if (schema instanceof z.ZodUnion) {
    return unwrapSchema(schema._zod.def.options[0])
  }
  // ZodPipe: z.coerce.number() etc. — the meaningful type is on the *out* side
  if (schema instanceof z.ZodPipe) {
    return unwrapSchema(schema._zod.def.out)
  }
  return { schema, isArray: false }
}

const TYPENAME_MAP: Partial<Record<string, FormFieldDef['type']>> = {
  'string': 'text',
  'number': 'number',
  'boolean': 'checkbox',
  'date': 'date',
  'enum': 'select',
  'file': 'file',
  'markdown-value': 'markdown-value',
}

export function deriveFieldsFromSchema(schema: ZodType): FormFieldDef[] {
  if (!(schema instanceof z.ZodObject)) return []

  return Object.entries(schema.shape).map(([name, fieldSchema]) => {
    const { schema: resolved, isArray } = unwrapSchema(fieldSchema as ZodType)
    const required = !isSchemaOptional(fieldSchema as ZodType)

    const { type, title, description, placeholder, ...meta } = defu(fieldSchema?.meta?.(), resolved.meta?.())

    const finalType = fieldSchema.meta()?.type ?? type ?? TYPENAME_MAP[resolved.def.type] ?? resolved.def.type

    if (import.meta.dev) {
      console.log({ name, type: finalType, isArray, required, title, description, placeholder, meta })
    }

    return {
      name,
      type: finalType as FormFieldDef['type'],
      isArray,
      required,
      label: title,
      description,
      placeholder: placeholder as string | undefined,
      meta: meta,
    }
  })
}

export function deriveSchemaFromSteppedForm<const TSteps extends FormStep[]>(form: SteppedForm<TSteps>) {
  return form.steps.reduce((acc, step) => {
    // @ts-expect-error This is just weak typing...
    return acc.extend(step.schema.shape)
  }, z.object({}))
}
