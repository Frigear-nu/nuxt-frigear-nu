export type AlertColor = | 'error'
  | 'info'
  | 'success'
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'neutral'
  | 'warning'

export type ResubmittableConfig = {
  start?: string
  fields: string[]
  alert?: {
    title: string
    description: string
    color?: AlertColor
  }
}

export type FormContentDoc = {
  path: string
  title?: string
  description?: string
  resubmittable?: boolean | ResubmittableConfig
}

export type FormSubmissionResponse = {
  id?: string | number
}
