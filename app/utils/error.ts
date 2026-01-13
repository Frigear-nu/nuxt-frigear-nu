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
