import type { z } from 'zod'
import { createContactFormSchema } from './schema'
import { contactSubjectKeys, contactSubjectLabels, type ContactSubjectKey } from './subjects'

export { createContactFormSchema }
export { contactSubjectKeys }
export type ContactFormSubjectKey = ContactSubjectKey

export type ContactFormOutput = z.output<ReturnType<typeof createContactFormSchema>>

export const contactSubjectSelectItems = contactSubjectKeys.map(value => ({
  value,
  label: contactSubjectLabels[value],
}))
