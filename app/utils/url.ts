export const withBaseUrl = (path?: string) => {
  const url = useRequestURL()

  if (!path) return url.origin

  const [pathname, query] = path.split('?')
  url.pathname = pathname || url.pathname

  if (query) {
    const newParams = new URLSearchParams(query)
    newParams.forEach((value, key) => url.searchParams.set(key, value))
  }

  return url.toString()
}
