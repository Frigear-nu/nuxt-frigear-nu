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

export const contactFormSchema = z
  .object({
    name: z.string('Navn er påkrævet.').min(1).max(30, { error: 'Navn er for langt.' }),
    email: z.email({ error: 'Skriv en gyldig e-mailadresse.' }),
    phone: z
      .string()
      .trim()
      .transform(v => v.replace(/[\s-]/g, ''))
      .refine(v => v === '' || /^\d{8}$/.test(v), { error: 'Telefon skal være 8 cifre.' })
      .optional(),
    subject: z.enum(contactSubjectKeys, { error: 'Vælg et emne.' }),
    subjectOther: z.string().trim().max(120, { error: 'For langt.' }).optional(),
    message: z.string('Besked er påkrævet.').min(1).max(5000, { error: 'Besked er for lang.' }),
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

export type ContactFormSchema = z.output<typeof contactFormSchema>
