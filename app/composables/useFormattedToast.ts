import type { IFetchError } from 'ofetch'
import type { Toast } from '#ui/composables/useToast'

export const useFormattedToast = () => {
  const { t } = useSiteI18n()

  function formatError(error: Error | IFetchError | { data?: { message?: string } }, overrides: Partial<Toast> = {}): Partial<Toast> {
    // We return i18n keys from the API
    // @ts-expect-error This cannot be typed somehow.
    if (error && error.data && error.data.message) {
    // @ts-expect-error This cannot be typed somehow.
      const msg = String(error.data.message)
      overrides.description = msg.includes('.') && !msg.endsWith('.') ? t(msg) : msg
    }
    return formatToastError(error as never, overrides)
  }

  function formatSuccess(title: string, description?: string, additional?: Toast): Partial<Toast> {
    return formatToastSuccess(
      title.includes('.') && !title.endsWith('.') ? t(title) : title,
      description?.includes('.') && !description?.endsWith('.') ? t(description) : description,
      additional,
    )
  }

  return {
    formatError,
    formatSuccess,
  }
}
