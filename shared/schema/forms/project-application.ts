import { z, type ZodSchema } from 'zod'

type FormField = {
  name: string
  labelKey?: string
  placeholderKey?: string
  hintKey?: string
  type: 'textarea' | 'input' | 'number' | 'date' | 'switch' | 'files'
  defaultValue?: string | number | boolean
  if?: string
}

type FormSection = {
  id: string
  labelKey?: string
  descriptionKey?: string
  fields: FormField[]
}

type Form = {
  schema: ZodSchema
  sections: FormSection[]
}

export const projectApplicationForm: Form = {
  schema: z.object({
    background: z.string(),
    purpose: z.string(),
    participants: z.coerce.number(),
    when: z.date(),
    // TODO..
  }),
  sections: [
    {
      id: 'about',
      fields: [
        { name: 'background', type: 'textarea' },
        { name: 'purpose', type: 'textarea' },
      ],
    },
    {
      id: 'project',
      fields: [
        { name: 'participants', type: 'number' },
        { name: 'when', type: 'date' },
        { name: 'projectSupportedByOthers', type: 'switch', defaultValue: false },
        { name: 'supportedByOther', type: 'textarea', if: 'projectSupportedByOthers' },
      ],
    },
    {
      id: 'budget',
      fields: [
        { name: 'totalBudget', type: 'number' },
        { name: 'fundsUsage', type: 'textarea' },
        { name: 'ownDeductible', type: 'number' },
        { name: 'profit', type: 'number' },
        { name: 'profitPurpose', type: 'textarea' },
      ],
    },
    {
      id: 'legal',
      fields: [
        { name: 'projectName', type: 'input' },
        { name: 'projectResponsible', type: 'textarea' },
        { name: 'cvrCpr', type: 'textarea' },
      ],
    },
    {
      id: 'info',
      fields: [
        { name: 'websiteSoMe', type: 'textarea' },
        { name: 'paymentDetails', type: 'textarea' },
      ],
    },
    {
      id: 'attachments',
      fields: [
        { name: 'attachments', type: 'files' },
      ],
    },
  ],
}
