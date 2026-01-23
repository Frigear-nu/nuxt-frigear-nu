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
      overrides.description = msg.includes('.') ? t(msg) : msg
    }
    return formatToastError(error as never, overrides)
  }

  return {
    formatError,
  }
}
