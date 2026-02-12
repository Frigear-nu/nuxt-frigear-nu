import { z, type ZodType } from 'zod/v4'

type FormSection = {
  id: string
  labelKey?: string
  descriptionKey?: string
  schema: ZodType
}

// TODO: Could possibly be flattened into one object instead of ID
export type SteppedForm = {
  id: string
  sections: FormSection[]
}

export const projectApplicationForm: SteppedForm = {
  id: 'project-application',
  sections: [
    {
      id: 'background',
      schema: z.object({
        // NOTE: We want to use i18n keys where possible, so we might have customized autoform...
        background: z.string().meta({ title: 'form.application.background', type: 'textarea' }),
        purpose: z.string().meta({ title: 'form.application.purpose', type: 'textarea' }),
      }),
    },
    {
      id: 'project',
      schema: z.object({
        participants: z.number(),
        when: z.date(),
        isSupportedByOthers: z.boolean().default(false),
        supportedByOthers: z.string().optional(),
      }),
    },
    {
      id: 'budget',
      schema: z.object({
        totalBudget: z.number(),
        fundsUsage: z.string(),
        ownDeductible: z.string(),
        profit: z.number().optional(),
        profitPurpose: z.string(),
      }),
    },
    {
      id: 'legal',

      schema: z.object({
        projectName: z.string(),
        projectResponsible: z.string(),
        cvrCpr: z.string(),
      }),
    },
    {
      id: 'info',
      schema: z.object({
        websiteSoMe: z.string(),
        paymentDetails: z.string(),
      }),
    },
    {
      id: 'attachments',
      schema: z.object({
        attachments: z.array(z.file()),
      }),
    },
  ],
}
