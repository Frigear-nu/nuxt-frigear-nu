import { blob } from '@nuxthub/blob'
import { NotFoundError } from '@nitrotool/errors'

export default defineEventHandler(async (event) => {
  await requireUserId(event)

  const mediaPath = getRouterParam(event, 'path')

  if (!mediaPath) {
    throw NotFoundError()
  }

  return blob.serve(event, mediaPath)
})
