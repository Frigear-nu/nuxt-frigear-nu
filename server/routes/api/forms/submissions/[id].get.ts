import { db } from '@nuxthub/db'
import { NotFoundError } from '@nitrotool/errors'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) throw NotFoundError()

  const submission = await db.query.formSubmissions.findFirst({
    where: (s, { eq }) => eq(s.id, id),
  })

  if (!submission || submission.status !== 'draft') throw NotFoundError()

  return {
    id: submission.id,
    data: submission.data,
    completedSteps: submission.completedSteps,
  }
})
