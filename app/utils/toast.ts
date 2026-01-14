import type { Toast } from '#ui/composables/useToast'

export function formatToastError(error: Error | never, overrides: Partial<Toast> = {}): Partial<Toast> {
  return {
    title: 'Error',
    description: error.message,
    icon: 'i-lucide-alert-circle',
    color: 'error',
    ...overrides,
  }
}

export const formatToastSuccess = (title: string, description?: string, additional?: Toast): Partial<Toast> => {
  return {
    title,
    description,
    icon: 'i-lucide-check-circle',
    color: 'success',
    ...additional,
  }
}

export const formatToast = (title: string, description?: string | Toast, toast?: Toast): Partial<Toast> => {
  let additional: Partial<Toast> = {}

  // meaning there will not be a toast item
  if (typeof description !== 'string') additional = description || {}
  else additional = toast || {}

  return {
    title,
    description: typeof description === 'string' ? description : undefined,
    ...additional,
  }
}
