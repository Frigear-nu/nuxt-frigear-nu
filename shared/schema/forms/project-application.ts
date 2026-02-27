import { z } from 'zod/v4'
import type { UnionFormSteps } from '#shared/types/form'
import { defineSteppedForm } from '#shared/form'

export const testApplicationForm = defineSteppedForm({
  id: 'test',
  steps: [
    {
      id: 'background',
      icon: 'i-lucide-book-text',
      labelKey: 'form.application.background',
      schema: z.object({
        background: z.string().meta({
          title: 'form.application.background',
          type: 'textarea',
          placeholder: 'enter some text',
        }),
        attachments: z.array(z.instanceof(File))
          .meta({
            title: 'Files',
            type: 'file',
            multiple: true,
            description: 'Add any attachments you might want to add',
          }),
      }),
    },
  ],
})

export const projectApplicationForm = defineSteppedForm({
  id: 'project-application',
  steps: [
    {
      id: 'background',
      icon: 'i-lucide-book-text',
      // labelKey: 'form.application.background',
      schema: z.object({
        background: z.string().meta({
          title: 'form.application.background',
          type: 'textarea',
          placeholder: 'enter some text',
        }),
        purpose: z.string().meta({
          title: 'form.application.purpose',
          type: 'textarea',
          placeholder: 'enter some text',
        }),
      }),
    },
    {
      id: 'project',
      schema: z.object({
        participants: z.coerce.number().meta({ title: 'form.application.participants' }),
        when: z.date().or(z.string()),
        isSupportedByOthers: z.coerce.boolean().default(false),
        supportedByOthers: z.string().optional(),
      }),
    },
    {
      id: 'budget',
      schema: z.object({
        totalBudget: z.coerce.number(),
        fundsUsage: z.string(),
        ownDeductible: z.string(),
        profit: z.coerce.number().optional(),
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
      labelKey: 'form.application.attachments',
      schema: z.object({
        attachments: z.array(z.instanceof(File))
          .meta({
            title: 'Files',
            type: 'file',
            multiple: true,
            description: 'Add any attachments you might want to add',
          }),
      }),
    },
  ],
})

export type ProjectApplicationForm = UnionFormSteps<typeof projectApplicationForm['steps']>
