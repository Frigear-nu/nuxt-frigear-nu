import { useRequestURL } from '#imports'

export const withLeadingUrl = (path: string) => {
  const url = useRequestURL()
  url.pathname = path
  return url.toString()
}
