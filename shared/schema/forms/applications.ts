import { z } from 'zod/v4'
import type { UnionFormSteps } from '#shared/types/form'
import { defineSteppedForm } from '#shared/form'

const acceptTerms = z.literal(true).meta({
  type: 'checkbox',
  title: '', // empty string means no label
  description: 'steppedForm.acceptTerms.description',
})

export const projectApplicationForm = defineSteppedForm({
  id: 'application',
  steps: [
    {
      id: 'background',
      icon: 'i-lucide-book-text',
      // labelKey: 'form.application.background',
      schema: z.object({
        background: z.string().meta({
          // title is translated to "label"
          // and the `<formId>.<stepId>.label` is the default key, so no need to fill it like this:
          // title: 'form.application.background.label', // as this is the default.
          type: 'textarea',
        }),
        purpose: z.string().meta({
          type: 'textarea',
        }),
      }),
    },
    {
      id: 'project',
      schema: z.object({
        participants: z.coerce.number().meta({
          title: 'form.application.participants',
        }),
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
      labelKey: 'form.application.attachments.label',
      schema: z.object({
        attachments: z.array(z.instanceof(File))
          .optional()
          .meta({
            title: 'Files',
            type: 'file',
            multiple: true,
            description: 'Add any attachments you might want to add',
          }),
        acceptTerms,
      }),
    },
  ],
})

export type ProjectApplicationForm = UnionFormSteps<typeof projectApplicationForm['steps']>

export const boardMemberApplicationForm = defineSteppedForm({
  id: 'board-member-application',
  steps: [
    {
      id: 'background',
      icon: 'i-lucide-book-text',
      labelKey: '**HELLO**',
      schema: z.object({
        name: z.string(),
        city: z.string(),
        email: z.email(),
        experience: z.array(z.object({
          startYear: z.date(),
          endYear: z.date().optional(),
          description: z.string().meta({ type: 'textarea' }),
        })).meta({
          type: 'textarea',
          repeatable: true,
        }),
        image: z.array(z.instanceof(File))
          .meta({
            type: 'file',
            multiple: true,
            description: 'Add your profile photo',
          }),
      }),
    },
  ],
})

// Test form
export const testApplicationForm = defineSteppedForm({
  id: 'test',
  steps: [
    {
      id: 'first',
      icon: 'i-lucide-book-text',
      labelKey: '**HELLO**',
      info: {
        icon: 'i-lucide-book-text',
        content: 'This is the [MARKDOWN]{.text-primary} description of this step!',
      },
      schema: z.object({
        other: z.string().meta({
          title: 'form.application.background',
          type: 'textarea',
          placeholder: 'enter some text',
        }),
      }),
    },
    {
      id: 'background',
      icon: 'i-lucide-book-text',
      labelKey: '**HELLO**',
      info: 'TEst info detail no custom icon',
      schema: z.object({
        background: z.string().meta({
          title: 'form.application.background',
          type: 'textarea',
          placeholder: 'enter some text',
        }),
      }),
    },
    {
      id: 'finish',
      labelKey: 'FINISHED',
      schema: z.object({
        acceptTerms,
      }),
    },
  ],
})
