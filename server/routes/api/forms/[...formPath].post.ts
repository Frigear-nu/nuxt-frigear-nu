import { withLeadingSlash } from 'ufo'
import { projectApplicationForm, boardMemberApplicationForm, testApplicationForm } from '#shared/schema/forms/applications'
import { deriveSchemaFromSteppedForm } from '#shared/form'
import { blob } from '@nuxthub/blob'
import { db, schema } from '@nuxthub/db'
import type { BlobObject } from '@nuxthub/core/blob'
import type { SteppedForm } from '#shared/types/form'
import { objectPick } from '@vueuse/core'

export default defineEventHandler(async (event) => {
  const formPath = getRouterParam(event, 'formPath')

  if (!formPath) throw createError({ statusCode: 404 })

  const form = await queryCollection(event, 'forms')
    .path(withLeadingSlash(formPath))
    .first()

  if (!form) throw createError({ statusCode: 404 })

  const submissionId = `form_sub_${createSafeId()}`

  const hardcodedForms = {
    'project-application': projectApplicationForm,
    'board-member-application': boardMemberApplicationForm,
    'test': testApplicationForm,
  }

  const definedForm = hardcodedForms[form.name as keyof typeof hardcodedForms]

  if (!definedForm) {
    throw createError({
      statusCode: 500,
      message: `Form ${form.name} is not defined`,
    })
  }
  // TODO: Load schema from the form file.
  const formSchema = deriveSchemaFromSteppedForm(definedForm as SteppedForm<never>)
  const parts = await readMultipartFormData(event)

  if (!parts) throw createError({ statusCode: 400, message: 'Invalid form data' })

  // Reconstruct the body object from FormData parts
  const rawBody: Record<string, unknown> = {}

  for (const part of parts) {
    const name = part.name
    if (!name) continue

    if (part.filename !== undefined) {
      // It's a file — convert the Buffer to a File object
      // @ts-expect-error This is not typed...
      const file = new File([part.data], part.filename, {
        type: part.type ?? 'application/octet-stream',
      })

      // Handle multiple files with the same key (append arrays)
      if (rawBody[name]) {
        rawBody[name] = [...(rawBody[name] as File[]), file]
      }
      else {
        rawBody[name] = [file]
      }
    }
    else {
      // Regular field — try to parse JSON, otherwise use raw string
      const value = part.data.toString()
      try {
        rawBody[name] = JSON.parse(value)
      }
      catch {
        rawBody[name] = value
      }
    }
  }

  // Now validate with your schema
  const body = formSchema.parse(rawBody)

  const files: BlobObject[] = []

  for (const key in body) {
    const value = body[key] as File[] | File | string[] | string
    const items = Array.isArray(value) ? value : [value]

    for (const item of items) {
      if (item?.constructor?.name === 'File' || item instanceof File) {
        const uploadedFile = await blob.put((item as File).name, item, {
          prefix: `forms/submissions/${submissionId}/${key}/`,
          addRandomSuffix: true,
        })
        files.push(uploadedFile)
        if (Array.isArray(body[key])) {
          body[key][items.indexOf(item)] = uploadedFile.pathname
        }
        else {
          body[key] = uploadedFile.pathname
        }
      }
    }
  }

  const payload = {
    submissionId,
    files,
    body,
  }

  const [storedSubmission] = await db
    .insert(schema.formSubmissions)
    .values({
      id: submissionId,
      path: formPath,
      data: body,
      files: files.map(file => ({
        ...file,
        uploadedAt: file.uploadedAt.getTime(),
      })),
      delivery: form.delivery,
      // TODO: This should probably be done in a queue/task
      deliveredAt: new Date(),
    })
    .returning()

  if (!storedSubmission) {
    throw createError({ status: 500, message: 'Could not store submission' })
  }

  // Handle deliveries
  // TODO: This should probably be done in a queue/task
  await deliverFormSubmission(event, form, payload)
  await deliverFormSubmissionReceipt(event, form, payload)

  return objectPick(storedSubmission, ['id', 'data', 'files', 'createdAt'])
})
