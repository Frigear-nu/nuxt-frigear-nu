import { z } from 'zod'

//* Subjects

export const contactSubjectKeys = [
  'volunteering',
  'partnership',
  'support',
  'payment',
  'governance',
  'finance',
  'complaint',
  'other',
] as const

export type ContactSubjectKey = (typeof contactSubjectKeys)[number]

export const contactSubjectLabels: Record<ContactSubjectKey, string> = {
  volunteering: 'Frivillig',
  partnership: 'Samarbejde',
  support: 'Support',
  payment: 'Betaling',
  governance: 'Bestyrelse',
  finance: 'Økonomi',
  complaint: 'Klage',
  other: 'Andet',
} as const

export const contactSubjectSelectItems = contactSubjectKeys.map(value => ({
  value,
  label: contactSubjectLabels[value],
}))

// **Schema

const requiredString = (requiredMsg: string) =>
  z
    .string({
      // Zod v4: customize 'undefined'/invalid-type case
      error: issue => (issue.input === undefined ? requiredMsg : undefined),
    })
    .trim()
    .min(1, { error: requiredMsg })

export const contactFormSchema = (() => {
  const email = requiredString('E-mail er påkrævet.').pipe(
    z.email({ error: 'Skriv en gyldig e-mailadresse.' }),
  )

  const phone = z
    .string()
    .trim()
    .transform(v => v.replace(/[\s-]/g, ''))
    .refine(v => v === '' || /^\d{8}$/.test(v), { error: 'Telefon skal være 8 cifre.' })
    .optional()

  return z
    .object({
      name: requiredString('Navn er påkrævet.').max(30, { error: 'Navn er for langt.' }),
      email,
      phone,
      subject: z.enum(contactSubjectKeys, { error: 'Vælg et emne.' }),
      subjectOther: z.string().trim().max(120, { error: 'For langt.' }).optional(),
      message: requiredString('Besked er påkrævet.').max(5000, { error: 'Besked er for lang.' }),
    })
    .superRefine((data, ctx) => {
      if (data.subject === 'other' && (!data.subjectOther || data.subjectOther.length === 0)) {
        ctx.addIssue({
          code: 'custom',
          path: ['subjectOther'],
          message: 'Udfyld feltet når du vælger "Andet".',
        })
      }
    })
})()

export type ContactForm = z.output<typeof contactFormSchema>
