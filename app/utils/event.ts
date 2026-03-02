import type { EventsCollectionItem } from '@nuxt/content'
import { withQuery } from 'ufo'
import { useAppConfig, useColorMode } from '#imports'

export const getEventImage = (event: Ref<EventsCollectionItem> | EventsCollectionItem) => {
  const item = toValue(event)
  if (!item) {
    return undefined
  }

  if (item && item.image) {
    return item.image
  }

  const appConfig = useAppConfig()
  const colorMode = useColorMode()
  const isDark = colorMode.value === 'dark'
  const segments = [
    'https://placehold.co',
    '1200x400',
    isDark ? '000000' : appConfig.ui?.colors?.neutral || '000000',
    isDark ? 'FFF' : '000',
  ]

  return withQuery(segments.join('/'), { text: item.title })
}
