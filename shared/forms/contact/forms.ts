import { z } from "zod"
import { createContactFormSchema } from "./schema"
import { contactSubjectKeys, contactSubjectLabels, type ContactSubjectKey } from "./subjects"

export { createContactFormSchema }
export { contactSubjectKeys }
export type ContactFormSubjectKey = ContactSubjectKey

// Build once (no need to recreate per render)
export const contactFormSchema = createContactFormSchema()

export type ContactFormInput = z.input<typeof contactFormSchema>
export type ContactFormOutput = z.output<typeof contactFormSchema>

export const contactSubjectSelectItems = contactSubjectKeys.map((value) => ({
  value,
  label: contactSubjectLabels[value],
}))
