import { blob } from '@nuxthub/blob'
import { db, schema } from '@nuxthub/db'
import { ClientError } from '@nitrotool/errors'
import { requireUserId } from '#server/utils/auth'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)

  const parts = await readMultipartFormData(event)

  if (!parts) throw ClientError('Invalid form data')

  const attachmentPaths: string[] = []
  let amount: number | undefined
  let description: string | undefined

  for (const part of parts) {
    const name = part.name
    if (!name) continue

    if (part.filename !== undefined) {
      const mimeType = part.type ?? 'application/octet-stream'

      if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        throw ClientError(`File type ${mimeType} is not allowed. Only images and PDFs are accepted.`)
      }

      if (part.data.length > MAX_FILE_SIZE) {
        throw ClientError('File exceeds maximum allowed size of 10 MB.')
      }

      const file = new File([part.data], part.filename, { type: mimeType })

      const uploadedFile = await blob.put(file.name, file, {
        prefix: `accounting/expenses/user_${userId}/`,
        addRandomSuffix: true,
      })

      attachmentPaths.push(uploadedFile.pathname)
    }
    else {
      const value = part.data.toString()
      if (name === 'amount') {
        const parsed = Number.parseFloat(value)
        if (Number.isNaN(parsed) || parsed <= 0) {
          throw ClientError('Amount must be a positive number.')
        }
        amount = parsed
      }
      else if (name === 'description') {
        description = value
      }
    }
  }

  if (amount === undefined) {
    throw ClientError('Amount is required.')
  }

  const [expense] = await db
    .insert(schema.expenses)
    .values({
      userId,
      amount,
      description,
      attachments: attachmentPaths,
    })
    .returning()

  return expense
})
