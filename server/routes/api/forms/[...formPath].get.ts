// for future usage...
import { withLeadingSlash } from 'ufo'
import { objectOmit } from '@vueuse/core'
import { NotFoundError } from '@nitrotool/errors'

export default defineEventHandler(async (event) => {
  const formPath = getRouterParam(event, 'formPath')

  if (!formPath) throw NotFoundError()

  const form = await queryCollection(event, 'forms')
    .path(withLeadingSlash(formPath))
    .first()

  if (!form) throw NotFoundError()

  return objectOmit(form, ['delivery'])
})
