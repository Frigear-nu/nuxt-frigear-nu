export const withBaseUrl = (path?: string) => {
  const url = getRequestURL(useEvent())
  url.pathname = path ?? ''
  return url.toString()
}

export const isInternalUrl = (url: string) => {
  if (url.startsWith('http')) return false

  if (!url.startsWith('/')) return false

  return true
}
