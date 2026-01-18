export const withBaseUrl = (path?: string) => {
  const url = getRequestURL(useEvent())
  url.pathname = path ?? ''
  return url.toString()
}
