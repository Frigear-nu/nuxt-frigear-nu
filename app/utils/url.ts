export const withBaseUrl = (path?: string) => {
  const url = useRequestURL()
  url.pathname = path ?? ''
  return url.toString()
}
