export default defineI18nLocaleDetector((event, config) => {
  const query = tryQueryLocale(event, { lang: '' })
  if (query) {
    console.log({ query })
    return query.toString()
  }

  const cookie = tryCookieLocale(event, { lang: '', name: 'i18n_locale' })
  if (cookie) {
    console.log({ cookie })
    return cookie.toString()
  }

  const header = tryHeaderLocale(event, { lang: '' })
  if (header) {
    console.log({ header })
    return header.toString()
  }

  return config.defaultLocale
})
