import { useSiteI18n } from '#imports'

export const useContent = () => {
  const { locale, defaultLocale } = useSiteI18n()
  const translatedProperty = (value: string | { [key: string]: string } | undefined): string | undefined => {
    if (!value) return undefined
    if (typeof value === 'string') {
      return value
    }
    return value[locale.value as string] || value[defaultLocale.value] || value as never
  }

  return { translatedProperty }
}
