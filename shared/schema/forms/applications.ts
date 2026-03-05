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
      id: 'info',
      schema: z.object({
        description: z.string().optional().meta({
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
      id: 'contactInfo',
      icon: 'i-lucide-book-text',
      labelKey: 'form.application.contactInfo.label',
      hint: {
        en: 'This step is for personal details about the person submitting the form.',
      },
      schema: z.object({
        fullName: z.string(),
        email: z.email(),
        phone: z.string().optional(),
      }),
    },
    {
      id: 'organizationInfo',
      schema: z.object({
        organizationName: z.string(),
        organizationNumber: z.string(),
        organizationAddress: z.string(),
        accountableParties: z.string().meta({
          type: 'textarea',
        }),
        organizationEmail: z.email(),
        organizationPhone: z.string().optional(),
      }),
    },
    {
      id: 'organizationAbout',
      schema: z.object({
        organizationAbout: z.string().meta({
          type: 'textarea',
        }),
        organizationWebsite: z.string().optional(),
        organizationFacebook: z.string().optional(),
        organizationInstagram: z.string().optional(),
        organizationTikTok: z.string().optional(),
        organizationYoutube: z.string().optional(),
        organizationLinkedIn: z.string().optional(),
      }),
    },
    {
      id: 'financialInfo',
      schema: z.object({
        bankName: z.string(),
        regNr: z.string(),
        accountNumber: z.string(),
        annualBudget: z.number(),
        ownContribution: z.number(),
        paidStaffAmount: z.number(),
        financialPatrons: z.string().meta({
          type: 'textarea',
        }),
      }),
    },
    {
      id: 'branding',
      schema: z.object({
        logo: z.array(z.file()).meta({
          type: 'file',
          multiple: true,
          // TODO: Make single file input work in a "slim" variant
          // variant: 'slim',
          // multiple: false,
        }),
        relevantImages: z.array(z.file()).meta({
          type: 'file',
          multiple: true,
        }),
        threeLineOrgPitch: z.string().meta({
          type: 'textarea',
        }),
        otherMedia: z.array(z.instanceof(File))
          .optional()
          .meta({
            type: 'file',
            multiple: true,
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
