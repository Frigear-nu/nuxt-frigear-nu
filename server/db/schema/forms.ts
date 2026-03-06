import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { createId } from '@paralleldrive/cuid2'
import type { BlobObject } from '@nuxthub/core/blob'
import type { CollectionForm } from '#shared/schema/content-form'

const createDomainId = (prefix?: string) => `${prefix}${createId()}`

type FormSubmissionFile = Omit<BlobObject, 'uploadedAt'> & { uploadedAt: number }

export const formSubmissions = sqliteTable('form_submissions', {
  id: text('id').primaryKey().$defaultFn(() => createDomainId('form_sub_')),
  path: text('path').notNull(), // references the form path (from content/forms/**)
  data: text('data', { mode: 'json' }).notNull().$type<{ [key: string]: unknown }>(),
  files: text('files', { mode: 'json' }).notNull().$type<FormSubmissionFile[]>(),
  delivery: text('delivery', { mode: 'json' }).notNull().$type<CollectionForm['delivery']>().default([]),
  deliveredAt: integer('delivered_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdateFn(() => new Date()),
})
