import { authorize } from 'nuxt-authorization/utils'
import { db } from '@nuxthub/db'
import { ClientError, NotFoundError } from '@nitrotool/errors'
import { canViewFormSubmissions } from '#shared/abilities/forms'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  await authorize(canViewFormSubmissions, user)

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
