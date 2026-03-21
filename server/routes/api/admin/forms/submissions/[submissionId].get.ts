import { authorize } from 'nuxt-authorization/utils'
import { isAdmin } from '#shared/abilities/admin'
import { db } from '@nuxthub/db'
import { ClientError, NotFoundError } from '@nitrotool/errors'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  await authorize(isAdmin, user)

  const submissionId = getRouterParam(event, 'submissionId')

  if (!submissionId) {
    throw ClientError('Missing required submissionId.')
  }

  const submission = await db.query.formSubmissions.findFirst({
    where: (formSubmission, { eq }) => eq(formSubmission.id, submissionId),
  })

  if (!submission) {
    throw NotFoundError()
  }

  return submission
})
