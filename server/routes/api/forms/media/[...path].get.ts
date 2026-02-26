import { blob } from '@nuxthub/blob'

export default defineEventHandler(async (event) => {
  await requireUserId(event)

  const mediaPath = getRouterParam(event, 'path')

  if (!mediaPath) {
    throw createError({ statusCode: 404 })
  }

  return blob.serve(event, mediaPath)
})
