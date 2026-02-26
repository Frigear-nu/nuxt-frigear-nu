// for future usage...
import { withLeadingSlash } from 'ufo'

export default defineEventHandler(async (event) => {
  const formPath = getRouterParam(event, 'formPath')

  if (!formPath) throw createError({ statusCode: 404 })

  const form = await queryCollection(event, 'forms')
    .path(withLeadingSlash(formPath))
    .first()

  if (!form) throw createError({ statusCode: 404 })

  return form
})
