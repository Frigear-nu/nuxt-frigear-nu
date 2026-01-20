export const withBaseUrl = (path?: string) => {
  const { protocol, hostname, port } = getRequestURL(useEvent())

  return `${protocol}//${hostname}${port ? `:${port}` : ''}${path ?? ''}`
}

export const isInternalUrl = (url: string) => {
  if (url.startsWith('http')) return false

  if (!url.startsWith('/')) return false

  return true
}
