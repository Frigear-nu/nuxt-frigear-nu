import type { FormsCollectionItem } from '@nuxt/content'
import { replaceVariables } from '#shared/template'
import type { H3Event } from 'h3'
import type { Component } from 'vue'

export const deliverFormSubmission = async (
  event: H3Event,
  form: FormsCollectionItem,
  payload: unknown,
) => {
  if (form.delivery && form.delivery.length > 0) {
    await sendDeliverables(event, form, form.delivery, payload)
  }
}
export const deliverFormSubmissionReceipt = async (
  event: H3Event,
  form: FormsCollectionItem,
  payload: unknown,
) => {
  if (form.receipts && form.receipts.length > 0) {
    await sendDeliverables(event, form, form.receipts, payload)
  }
}

const getDeliveryVariables = (event: H3Event) => {
  const { mail: { to: defaultToEmail } } = useRuntimeConfig(event)

  return {
    ...Object.fromEntries(
      Object.entries(useRuntimeConfig(event).contact || {})
        .map(([key, value]) => {
          return [`contact.${key}`, value]
        }),
    ),
    'contact.default': defaultToEmail,
  }
}

const replaceTemplateVars = (
  event: H3Event,
  destination: string,
  payload: unknown = {},
) => {
  return replaceVariables(destination, {
    ...getDeliveryVariables(event),
    ...typeof payload === 'object' ? payload : {},
  })
}

export const sendDeliverables = async (
  event: H3Event,
  form: FormsCollectionItem,
  deliverables: FormsCollectionItem['delivery'] | FormsCollectionItem['receipts'],
  payload: unknown,
  template?: Component,
  type?: 'submission' | 'receipt',
) => {
  const { mail: { from } } = useRuntimeConfig(event)
  await Promise.all(deliverables.map(async (delivery) => {
    if (delivery.channel === 'email') {
      const destinations = delivery.destination.map((destination) => {
        return replaceTemplateVars(event, destination, { form: payload })
      })

      if (import.meta.dev) {
        console.log(`Sending email to ${destinations} with payload:`, payload)
        return
      }

      // TODO: Styling & attachments
      // TODO: Deliver markdown email template
      if (template) {
        return sendEmailTemplate(event, {
          component: template,
          from,
          to: destinations,
          // @ts-expect-error This is not typed...
          subject: delivery.subject || '',
          props: {
            form,
            payload,
            delivery,
            destinations,
            type,
          },
        })
      }

      //
      if (type === 'submission') {
        return sendEmail(event, {
          from,
          to: destinations,
          subject: `New submission in ${form.title}`,
          text: JSON.stringify(payload),
        })
      }

      //
      if (type === 'receipt') {
        console.log('Sending receipt email to', destinations)
      }

      return Promise.resolve()
    }

    // Webhook delivery
    if (delivery.channel === 'webhook') {
      const headers = Object.fromEntries(
        Object.entries(delivery?.headers || {})
          .map(([key, value]) => {
            return [key, replaceTemplateVars(event, value, { form: payload })]
          }),
      )
      return Promise.all(delivery.destination.map(async (destination) => {
        return $fetch(replaceTemplateVars(event, destination, { form: payload }), {
          method: delivery?.method || 'POST',
          body: payload as never,
          headers,
        })
      }))
    }
  }))
}
