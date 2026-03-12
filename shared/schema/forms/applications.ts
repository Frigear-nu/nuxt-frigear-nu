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
            da: `
::u-page-section
---
class: py-0
ui:
  container: py-0 sm:py-0 lg:py-0
  title: text-3xl sm:text-4xl lg:text-5xl
---
#title
Sådan ansøger du om Frigear-støtte 💰


#description
Hvis dit projekt har flere dele, der kan støttes med forskellige budgetter for at komme i luften, kan du udfylde formularen og indsende de oplysninger, der er relevante for netop denne del – og til sidst vil du have mulighed for at ansøge igen om et andet budget under samme projekt.
::



::accordion
  :::accordion-item{label="Ansøgningseksempler" icon="i-lucide-info"}
  
  ### Forskellige budgetter for samme slutmål:
  >_Vi vil bygge et komplet skatepark til vores lokalsamfund_
  
  **_Første ansøgning_** :br
  **1.** Fuldt skatepark – Budget: 350k :br
  **_Endnu en ansøgning_** :br
  **2.** Én halfpipe-rampe – Budget: 25k :br
  **_Yderligere en ansøgning_** :br
  **3.** Køb 5 rails – Budget: 5k :br
  :::
::
`,
            // ENGLISH:
            en: `
::u-page-section
---
class: py-0
ui:
  container: py-0 sm:py-0 lg:py-0
  title: text-3xl sm:text-4xl lg:text-5xl
---
#title
How to apply for Frigear funding 💰


#description
If your project has multiple parts that can be supported, with different budgets to get it flying, -you can run through the form and submit the information relevant for this specifically, and at the end you will have the option to apply again for another budget under same project.
::



::accordion
  :::accordion-item{label="Application Examples" icon="i-lucide-info"}
  
  ### Different budgets for the same endgoal:
  >_We want to build a complete skatepark for our community_
  
  **_First Application_** :br
  **1.** Full skatepark - Budget: 350k :br
  **_Another Application_** :br
  **2.** One halfpipe ramp - Budget: 25k :br
  **_Yet Another Application_** :br
  **3.** Buy 5 rails - Budget: 5k :br
  :::
::
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
        da: 'Dette er for personlige detaljer om den som sender skemaet.',
        en: 'This step is for personal details about the person submitting the form.',
      },
      schema: z.object({
        fullName: z.string().meta({
          autocomplete: 'name',
          hint: {
            da: 'Dit fulde navn',
            en: 'Your full name',
          },
        }),
        email: z.email().meta({
          hint: {
            en: 'English hint text',
            da: 'Danish hint text',
          },
        }),
        phone: z.string().optional(),
      }),
    },
    {
      id: 'organizationInfo',
      schema: z.object({
        organizationName: z.string(),
        organizationNumber: z.string(),
        organizationAddressStreet: z.string().meta({
          autocomplete: 'street-address',
        }),
        organizationAddressCo: z.string().optional(),
        organizationAddressPostcode: z.string().meta({
          autocomplete: 'postal-code',
        }),
        organizationAddressCity: z.string(),
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
        organizationWebsite: z.string().optional().meta({
          autocomplete: 'url',
        }),
        organizationFacebook: z.string().optional(),
        organizationInstagram: z.string().optional(),
        organizationTikTok: z.string().optional(),
        organizationYouTube: z.string().optional(),
        organizationLinkedIn: z.string().optional(),
      }),
    },
    {
      id: 'financialInfo',
      schema: z.object({
        bankName: z.string(),
        regNr: z.string().length(4),
        accountNumber: z.string(),
        annualBudget: z.number(),
        ownContribution: z.number(),
        paidStaffAmount: z.number().meta({
          hint: {
            da: 'Personale med betaling',
            en: 'Paid staff',
          },
        }),
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
        otherMedia: z.array(z.file())
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
      hint: {
        icon: 'i-lucide-book-text',
        content: 'This is the [MARKDOWN]{.text-primary} description of this step!',
      },
      schema: z.object({
        other: z.string().meta({
          // you can use i18n manually
          // title: 'form.application.background',
          type: 'textarea',
          placeholder: 'enter some text',
        }),
      }),
    },
    {
      id: 'finish',
      labelKey: 'FINISHED',
      schema: z.object({
        files: z.array(z.file()).meta({
          type: 'file',
          multiple: true,
        }),
        acceptTerms,
      }),
    },
  ],
})
