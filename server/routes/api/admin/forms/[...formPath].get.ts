import { isAdmin } from '#shared/abilities/admin'
import { authorize } from 'nuxt-authorization/utils'
import { withLeadingSlash, withoutLeadingSlash } from 'ufo'
import { NotFoundError } from '@nitrotool/errors'
import { db } from '@nuxthub/db'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  await authorize(isAdmin, user)

  const formPath = getRouterParam(event, 'formPath')

  const form = await queryCollection(event, 'forms')
    .path(withLeadingSlash(formPath))
    .first()

  if (!form || !form.path) {
    throw NotFoundError()
  }

  const submissions = await db.query.formSubmissions.findMany({
    where: (formSubmissions, { eq }) => {
      return eq(formSubmissions.path, withoutLeadingSlash(form.path))
    },
  })

  return submissions
})
