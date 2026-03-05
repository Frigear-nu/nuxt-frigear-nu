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
      id: 'description',
      schema: z.object({
        description: z.string().optional().meta({
          title: 'form.application.description',
          type: 'markdown-value',
          content: {
            da: 'Switch to english to see content...',
            en: `

::h2{.mt-0}
ℹ️ Single budget projects
::


Just run through the form and fill in the required fields, -sit back and relax . . .

## ℹ️ Multi budget projects

If your project has multiple parts that can be supported, with different budgets to get it flying, -you can run through
the form and submit the information relevant for this specifically, and at the end you will have the option to apply
again for another budget under same project.

💡

_We want to build a complete skatepark for our community_

*** Different budgets for the same endgoal:

**_First Application_**

**1.** Full skatepark - Budget: 350k

**_Another Application_**

**2.** One halfpipe ramp - Budget: 25k

**_Yet Another Application_**

**3.** Buy 5 rails - Budget: 5k
            `,
          },

        }),
      }),
    },
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
        background: z.string().meta({
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
        acceptTerms,
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
