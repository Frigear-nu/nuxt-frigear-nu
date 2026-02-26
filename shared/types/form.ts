import type { ZodType } from 'zod/v4'
import type { SelectItem, RadioGroupItem, InputMenuItem } from '@nuxt/ui'

type BaseField = {
  name: string
  label?: string
  description?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export type TextField = BaseField & {
  type: 'text' | 'email' | 'password'
}

export type TextareaField = BaseField & {
  type: 'textarea'
  rows?: number
}

export type SelectField = BaseField & {
  type: 'select'
  options: SelectItem[]
}

export type ComboboxField = BaseField & {
  type: 'combobox'
  options: InputMenuItem[]
}

export type RadioField = BaseField & {
  type: 'radio'
  options: RadioGroupItem[]
}

export type CheckboxField = BaseField & {
  type: 'checkbox'
}

export type DateField = BaseField & {
  type: 'date'
  minValue?: string // ISO date string, e.g. '2024-01-01'
  maxValue?: string
}

export type FileField = BaseField & {
  type: 'file'
  accept?: string
  multiple?: boolean
}

export type FormFieldDef
  = | TextField
    | TextareaField
    | SelectField
    | ComboboxField
    | RadioField
    | CheckboxField
    | DateField
    | FileField

export type FormStep<TSchema extends ZodType = ZodType> = {
  id: string
  icon?: string
  labelKey?: string
  descriptionKey?: string
  schema: TSchema
  fields?: FormFieldDef[]
}

export type SteppedForm<TSteps extends FormStep[]> = {
  id: string
  steps: TSteps
  // TODO: Make this be  the whole object w/o step naming or with?
  // schema?: UnionFormSteps<TSteps>
}

type UnionToIntersection<U>
  = (U extends unknown ? (k: U) => void : never) extends
  (k: infer I) => void ? I : never

type ExtractObjectShape<T>
  = T extends ZodType<infer Shape>
    ? Shape extends Record<string, unknown>
      ? Shape
      : never
    : never

export type UnionFormSteps<TSteps extends FormStep[]>
  = UnionToIntersection<ExtractObjectShape<TSteps[number]['schema']>> extends Record<string, unknown>
    ? UnionToIntersection<ExtractObjectShape<TSteps[number]['schema']>>
    : Record<string, unknown>
