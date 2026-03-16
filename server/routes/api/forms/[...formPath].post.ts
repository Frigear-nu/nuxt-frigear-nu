import { withLeadingSlash } from 'ufo'
import { projectApplicationForm, boardMemberApplicationForm, testApplicationForm } from '#shared/schema/forms/applications'
import { deriveSchemaFromSteppedForm } from '#shared/form'
import { blob } from '@nuxthub/blob'
import { db, schema } from '@nuxthub/db'
import type { BlobObject } from '@nuxthub/core/blob'
import { replaceVariables } from '#shared/template'
import type { SteppedForm } from '#shared/types/form'
import { objectPick } from '@vueuse/core'
import { z } from 'zod/v4'

export default defineEventHandler(async (event) => {
  const { mail: { from, to: defaultToEmail } } = useRuntimeConfig(event)

  const { formPath } = await getValidatedRouterParams(event, z.object({
    formPath: z.string(),
  }).parse)

  const fullFormPath = withLeadingSlash(formPath)

  const form = await queryCollection(event, 'forms')
    .path(fullFormPath)
    .first()

  if (!form) throw createError({ status: 404, message: `Form "${fullFormPath}" not found` })

  const submissionId = `form_sub_${createSafeId()}`

  const hardcodedForms = {
    'project-application': projectApplicationForm,
    'board-member-application': boardMemberApplicationForm,
    'test': testApplicationForm,
  }

  const definedForm = hardcodedForms[form.name as keyof typeof hardcodedForms]

  if (!definedForm) {
    throw createError({
      status: 500,
      message: `Form ${form.name} is not defined`,
    })
  }

  // TODO: We should be able to save a step as well - so there should be a function for:
  //  - setFormSubmissionStep()
  //  or - appendFormSubmission()
  // TODO: Load schema from the form file.
  const formSchema = deriveSchemaFromSteppedForm(definedForm as SteppedForm<never>)
  const parts = await readMultipartFormData(event)

  if (!parts) throw createError({ status: 400, message: 'Invalid form data' })

  // Reconstruct the body object from FormData parts
  const rawBody: Record<string, unknown> = {}

  for (const part of parts) {
    const name = part.name
    if (!name) continue

    if (part.filename !== undefined) {
      // It's a file — convert the Buffer to a File object
      // @ts-expect-error Not properly typed.
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

  // validate...
  const body = formSchema.parse(rawBody)

  const files: BlobObject[] = []

  for (const key in body) {
    const value = body[key] as File[] | File | string[] | string
    const items = Array.isArray(value) ? value : [value]

    for (const item of items) {
      // upload file to storage
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
    throw createError({
      status: 500,
      message: 'Could not store submission',
    })
  }

  // Handle deliveries
  // TODO: This should probably be done in a queue/task
  if (form.delivery && form.delivery.length > 0) {
    const contactEmails = {
      ...Object.fromEntries(
        Object.entries(useRuntimeConfig(event).contact || {})
          .map(([key, value]) => {
            return [`contact.${key}`, value]
          }),
      ),
      'contact.default': defaultToEmail,
    }
    const replaceTemplateVars = (destination: string) => {
      return replaceVariables(destination, {
        ...contactEmails,
      })
    }
    await Promise.all(form.delivery.map(async (delivery) => {
      // Email delivery
      if (delivery.channel === 'email') {
        const destinations = delivery.destination.map(replaceTemplateVars)
        if (import.meta.dev) {
          console.log(`Sending email to ${destinations} with payload:`, payload)
          return
        }
        // TODO: Styling & attachments
        return sendEmail(event, {
          from,
          to: destinations,
          subject: `New submission in ${form.title}`,
          text: JSON.stringify(payload),
        })
      }

      // Webhook delivery
      if (delivery.channel === 'webhook') {
        const headers = Object.fromEntries(
          Object.entries(delivery?.headers || {})
            .map(([key, value]) => {
              return [key, replaceTemplateVars(value)]
            }),
        )
        return Promise.all(delivery.destination.map(async (destination) => {
          return $fetch(replaceTemplateVars(destination), {
            method: delivery?.method || 'POST',
            body: payload,
            headers,
          })
        }))
      }

      throw new Error(`Unsupported delivery: ${JSON.stringify(delivery)}`)
    }))
  }

  return objectPick(storedSubmission, ['id', 'data', 'files', 'createdAt'])
})
