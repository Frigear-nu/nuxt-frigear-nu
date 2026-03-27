import { withLeadingSlash } from 'ufo'
import { db, schema } from '@nuxthub/db'
import { and, eq } from 'drizzle-orm'

type DraftBody = {
  submissionId?: string
  data: Record<string, unknown>
  completedSteps: number
}

export default defineEventHandler(async (event) => {
  const formPath = getRouterParam(event, 'formPath')

  if (!formPath) throw createError({ statusCode: 404 })

  const form = await queryCollection(event, 'forms')
    .path(withLeadingSlash(formPath))
    .first()

  if (!form) throw createError({ statusCode: 404 })

  const body = await readBody<DraftBody>(event)

  if (!body?.data || typeof body.completedSteps !== 'number') {
    throw createError({ statusCode: 400, message: 'Invalid draft body' })
  }

  if (body.submissionId) {
    // Update existing draft — only if it is still in draft status
    const [updated] = await db
      .update(schema.formSubmissions)
      .set({
        data: body.data,
        completedSteps: body.completedSteps,
      })
      .where(
        and(
          eq(schema.formSubmissions.id, body.submissionId),
          eq(schema.formSubmissions.status, 'draft'),
        ),
      )
      .returning()

    if (!updated) {
      throw createError({ statusCode: 404, message: 'Draft not found' })
    }

    return { id: updated.id }
  }

  // Create new draft
  const [created] = await db
    .insert(schema.formSubmissions)
    .values({
      path: formPath,
      status: 'draft',
      data: body.data,
      files: [],
      delivery: form.delivery,
      completedSteps: body.completedSteps,
    })
    .returning()

  if (!created) {
    throw createError({ statusCode: 500, message: 'Failed to create draft' })
  }

  return { id: created.id }
})
