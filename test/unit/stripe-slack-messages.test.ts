import { describe, expect, it } from 'vitest'
import type Stripe from 'stripe'
import {
  ZERO_DECIMAL_CURRENCIES,
  buildCustomerCreatedMessage,
  buildPaymentFailedMessage,
} from '../../server/utils/stripe-slack-messages'

// Minimal Stripe object factories — only the fields our functions actually read
function makePaymentIntent(overrides: Partial<Stripe.PaymentIntent> = {}): Stripe.PaymentIntent {
  return {
    id: 'pi_test_123',
    object: 'payment_intent',
    amount: 10400,
    currency: 'dkk',
    customer: 'cus_test_456',
    description: null,
    metadata: {},
    last_payment_error: null,
    ...overrides,
  } as unknown as Stripe.PaymentIntent
}

function makeCustomer(overrides: Partial<Stripe.Customer> = {}): Stripe.Customer {
  return {
    id: 'cus_test_456',
    object: 'customer',
    name: 'Jane Doe',
    email: 'jane@frigear.nu',
    ...overrides,
  } as unknown as Stripe.Customer
}

// ─── ZERO_DECIMAL_CURRENCIES ────────────────────────────────────────────────

describe('ZERO_DECIMAL_CURRENCIES', () => {
  it('includes JPY', () => {
    expect(ZERO_DECIMAL_CURRENCIES.has('jpy')).toBe(true)
  })

  it('does not include DKK', () => {
    expect(ZERO_DECIMAL_CURRENCIES.has('dkk')).toBe(false)
  })
})

// ─── buildPaymentFailedMessage ───────────────────────────────────────────────

describe('buildPaymentFailedMessage', () => {
  it('formats amount in a two-decimal currency (DKK)', () => {
    const msg = buildPaymentFailedMessage(makePaymentIntent({ amount: 10400, currency: 'dkk' }))
    expect(msg.text).toContain('104.00 DKK')
  })

  it('formats amount correctly for a zero-decimal currency (JPY)', () => {
    const msg = buildPaymentFailedMessage(makePaymentIntent({ amount: 1500, currency: 'jpy' }))
    expect(msg.text).toContain('1500 JPY')
  })

  it('includes customer string ID in the message', () => {
    const msg = buildPaymentFailedMessage(
      makePaymentIntent({ customer: 'cus_abc' }),
    )
    expect(msg.text).toContain('cus_abc')
  })

  it('includes customer id when customer is an object', () => {
    const msg = buildPaymentFailedMessage(
      makePaymentIntent({ customer: { id: 'cus_obj' } as Stripe.Customer }),
    )
    expect(msg.text).toContain('cus_obj')
  })

  it('uses "unknown" when customer is null', () => {
    const msg = buildPaymentFailedMessage(makePaymentIntent({ customer: null }))
    expect(msg.text).toContain('unknown')
  })

  it('includes description in the text when present', () => {
    const msg = buildPaymentFailedMessage(
      makePaymentIntent({ description: 'Membership 2025' }),
    )
    expect(msg.text).toContain('Membership 2025')
  })

  it('falls back to metadata.description when description is null', () => {
    const msg = buildPaymentFailedMessage(
      makePaymentIntent({ description: null, metadata: { description: 'meta desc' } }),
    )
    expect(msg.text).toContain('meta desc')
  })

  it('includes the failure reason', () => {
    const msg = buildPaymentFailedMessage(
      makePaymentIntent({ last_payment_error: { message: 'Card declined' } as Stripe.StripeRawError }),
    )
    expect(msg.text).toContain('Card declined')
  })

  it('uses "unknown reason" when last_payment_error is null', () => {
    const msg = buildPaymentFailedMessage(makePaymentIntent({ last_payment_error: null }))
    expect(msg.text).toContain('unknown reason')
  })

  it('returns a block message with two section blocks', () => {
    const msg = buildPaymentFailedMessage(makePaymentIntent()) as { blocks: unknown[] }
    expect(msg.blocks).toHaveLength(2)
  })

  it('includes payment intent ID in the fields block', () => {
    const msg = buildPaymentFailedMessage(makePaymentIntent({ id: 'pi_unique_99' })) as {
      blocks: Array<{ fields?: Array<{ text: string }> }>
    }
    const fieldsBlock = msg.blocks[1]
    const allFieldText = fieldsBlock?.fields?.map(f => f.text).join(' ') ?? ''
    expect(allFieldText).toContain('pi_unique_99')
  })
})

// ─── buildCustomerCreatedMessage ─────────────────────────────────────────────

describe('buildCustomerCreatedMessage', () => {
  it('includes customer name and email in the text', () => {
    const msg = buildCustomerCreatedMessage(makeCustomer())
    expect(msg.text).toContain('Jane Doe')
    expect(msg.text).toContain('jane@frigear.nu')
  })

  it('uses "unknown" for name when customer.name is null', () => {
    const msg = buildCustomerCreatedMessage(makeCustomer({ name: null }))
    expect(msg.text).toContain('unknown')
  })

  it('uses "unknown" for email when customer.email is null', () => {
    const msg = buildCustomerCreatedMessage(makeCustomer({ email: null }))
    expect(msg.text).toContain('unknown')
  })

  it('includes the customer ID in the fields block', () => {
    const msg = buildCustomerCreatedMessage(makeCustomer({ id: 'cus_special_99' })) as {
      blocks: Array<{ fields?: Array<{ text: string }> }>
    }
    const fieldsBlock = msg.blocks[1]
    const allFieldText = fieldsBlock?.fields?.map(f => f.text).join(' ') ?? ''
    expect(allFieldText).toContain('cus_special_99')
  })

  it('returns a block message with two section blocks', () => {
    const msg = buildCustomerCreatedMessage(makeCustomer()) as { blocks: unknown[] }
    expect(msg.blocks).toHaveLength(2)
  })

  it('sets a plain-text fallback on the message', () => {
    const msg = buildCustomerCreatedMessage(makeCustomer())
    expect(typeof msg.text).toBe('string')
    expect((msg.text as string).length).toBeGreaterThan(0)
  })
})
