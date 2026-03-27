import type Stripe from 'stripe'
import type { SlackMessage } from './slack'

// Zero-decimal currencies should not be divided by 100 when formatting amounts
// See: https://stripe.com/docs/currencies#zero-decimal
export const ZERO_DECIMAL_CURRENCIES = new Set([
  'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga',
  'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf',
])

export const buildPaymentFailedMessage = (paymentIntent: Stripe.PaymentIntent): SlackMessage => {
  const currency = paymentIntent.currency.toUpperCase()
  const divisor = ZERO_DECIMAL_CURRENCIES.has(paymentIntent.currency.toLowerCase()) ? 1 : 100
  const amount = (paymentIntent.amount / divisor).toFixed(divisor === 1 ? 0 : 2)
  const customer = typeof paymentIntent.customer === 'string'
    ? paymentIntent.customer
    : paymentIntent.customer?.id ?? 'unknown'
  const description = paymentIntent.description ?? paymentIntent.metadata?.description ?? ''
  const failureMessage = paymentIntent.last_payment_error?.message ?? 'unknown reason'

  const text = description
    ? `:x: *Payment failed:* A payment of ${amount} ${currency} for _${description}_ (customer: ${customer}) failed — ${failureMessage}`
    : `:x: *Payment failed:* A payment of ${amount} ${currency} from customer ${customer} failed — ${failureMessage}`

  return {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text,
        },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Amount:*\n${amount} ${currency}` },
          { type: 'mrkdwn', text: `*Customer:*\n${customer}` },
          { type: 'mrkdwn', text: `*Reason:*\n${failureMessage}` },
          { type: 'mrkdwn', text: `*Payment Intent:*\n${paymentIntent.id}` },
        ],
      },
    ],
    text,
  }
}

export const buildCustomerCreatedMessage = (customer: Stripe.Customer): SlackMessage => {
  const name = customer.name ?? 'unknown'
  const email = customer.email ?? 'unknown'
  const text = `:bust_in_silhouette: *New customer:* ${name} (${email})`

  return {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text,
        },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Name:*\n${name}` },
          { type: 'mrkdwn', text: `*Email:*\n${email}` },
          { type: 'mrkdwn', text: `*Customer ID:*\n${customer.id}` },
        ],
      },
    ],
    text,
  }
}
