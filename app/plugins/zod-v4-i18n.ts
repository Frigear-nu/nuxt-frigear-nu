import * as z4 from 'zod/v4'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'

export default defineNuxtPlugin({
  name: 'zod-v4-i18n',
  dependsOn: ['i18n:plugin'],
  parallel: true,
  setup: (nuxtApp) => {
    // Do not run this in SSr or prerendering (since it will rely on user input anyways)
    if (import.meta.prerender || import.meta.server) {
      return
    }
    const { dateFormat } = useRuntimeConfig().public.zodI18n
    const i18n = nuxtApp.$i18n as {
      t: (key: string, values?: Record<string, unknown>) => string
      d: (value: Date, format?: Intl.DateTimeFormatOptions | string) => string
    }
    const { t, d } = i18n

    z4.config({
      customError: (iss) => {
        switch (iss.code) {
          case 'invalid_type':
            if (iss.input === undefined) {
              return t('zodI18n.errors.invalid_type_received_undefined')
            }

            return t('zodI18n.errors.invalid_type', {
              expected: t(`zodI18n.types.${iss.expected}`),
              received: t(`zodI18n.types.${iss.input === null ? 'null' : typeof iss.input}`),
            })

          case 'invalid_format':
            if (iss.format === 'email') {
              return t('zodI18n.errors.invalid_string.email', {
                validation: t('zodI18n.validations.email'),
              })
            }
            return undefined

          case 'too_small':
            return t(
              `zodI18n.errors.too_small.${iss.origin}.${iss.exact ? 'exact' : iss.inclusive ? 'inclusive' : 'not_inclusive'}`,
              {
                minimum: iss.origin === 'date' ? d(new Date(iss.minimum as number), dateFormat) : iss.minimum,
              },
            )

          case 'too_big':
            return t(
              `zodI18n.errors.too_big.${iss.origin}.${iss.exact ? 'exact' : iss.inclusive ? 'inclusive' : 'not_inclusive'}`,
              {
                maximum: iss.origin === 'date' ? d(new Date(iss.maximum as number), dateFormat) : iss.maximum,
              },
            )

          default:
            return undefined
        }
      },
    })
  },
})
