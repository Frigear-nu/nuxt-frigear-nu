import type { CollectionForm } from '#shared/schema/content-form'

export type AlertColor = | 'error'
  | 'info'
  | 'success'
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'neutral'
  | 'warning'

export type ResubmittableConfig = Extract<
  CollectionForm['resubmittable'],
  Record<string, unknown>
>

export type FormSubmissionResponse = {
  id?: string | number
}
