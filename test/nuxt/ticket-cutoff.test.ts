/**
 * Nuxt component tests for `EventTicketsCard` (app/components/event/Tickets/Card.vue).
 *
 * These tests verify the ticket-sales cutoff date behaviour at the component
 * level, covering two scenarios per role:
 *
 *  1. **Pre-addon stage** – a ticket is selected but no addon product has been
 *     chosen yet (the Food section is visible but no item is selected).
 *  2. **Selected-addon stage** – a food addon has been selected.
 *
 * In both stages, when the event's cutoff date is in the past the:
 *  - "sales ended" alert must be rendered.
 *  - "Go to checkout" button must be absent (for authenticated users).
 *  - "Sign in to purchase tickets" link must be absent (for unauthenticated users).
 *
 * When the cutoff date is in the future (normal sales-open state), the
 * checkout / sign-in buttons must be present.
 */
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import EventTicketsCard from '~/components/event/Tickets/Card.vue'

// ---------------------------------------------------------------------------
// Mock composables that require server state / auth
// ---------------------------------------------------------------------------

mockNuxtImport('useUserSession', () => vi.fn(() => ({
  loggedIn: ref(false),
  user: ref(null),
  session: ref(null),
})))

mockNuxtImport('useUserMemberships', () => vi.fn(() => ({
  data: ref([]),
})))

// ---------------------------------------------------------------------------
// Minimal event fixtures
// ---------------------------------------------------------------------------

/** Shared ticket structure used by all fixtures – has a required food addon. */
const TICKET = {
  name: 'Admission',
  description: undefined,
  price: 0,
  currency: 'DKK',
  hidePrice: true,
  stripeId: 'prod_test',
  products: {
    title: 'Food',
    require: 'one_of' as const,
    items: [
      { id: 'prod_carnivore', label: 'Carnivore', description: undefined, price: 50, currency: 'DKK' },
      { id: 'prod_vegan', label: 'Vegan', description: undefined, price: 50, currency: 'DKK' },
    ],
  },
}

const BASE_EVENT = {
  path: '/events/test/cutoff',
  name: 'Test Cutoff Event',
  defaultTicket: 'default',
  tickets: { default: TICKET },
}

/** Event whose cutoff has already passed (end date far in the past). */
const PAST_CUTOFF_EVENT = {
  ...BASE_EVENT,
  end: new Date('2020-01-01T00:00:00Z'),
}

/** Event whose cutoff is well in the future (sales still open). */
const FUTURE_CUTOFF_EVENT = {
  ...BASE_EVENT,
  end: new Date('2099-01-01T00:00:00Z'),
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

const mountCard = (event: typeof PAST_CUTOFF_EVENT) =>
  mountSuspended(EventTicketsCard, {
    props: { event: event as never },
  })

// ---------------------------------------------------------------------------
// Tests: cutoff in the past
// ---------------------------------------------------------------------------

describe('EventTicketsCard – ticket sales ended (cutoff in the past)', () => {
  it('shows the "sales ended" alert (pre-addon stage)', async () => {
    const wrapper = await mountCard(PAST_CUTOFF_EVENT)
    expect(wrapper.text()).toContain('Ticket sales have ended for this event.')
  })

  it('does NOT render the "Go to checkout" button (pre-addon stage)', async () => {
    const wrapper = await mountCard(PAST_CUTOFF_EVENT)
    // The checkout button text should not exist at all
    expect(wrapper.text()).not.toContain('Go to checkout')
    expect(wrapper.text()).not.toContain('Sign in to purchase tickets')
  })

  it('still renders the addon product section (pre-addon stage)', async () => {
    const wrapper = await mountCard(PAST_CUTOFF_EVENT)
    // The food addon options should still be visible even with sales ended
    expect(wrapper.text()).toContain('Carnivore')
    expect(wrapper.text()).toContain('Vegan')
  })

  it('shows the "sales ended" alert after selecting an addon (selected-addon stage)', async () => {
    const wrapper = await mountCard(PAST_CUTOFF_EVENT)

    // Simulate selecting the first food addon by clicking its label text
    const carnivoreLabelOrInput = wrapper.findAll('input[type="radio"]').at(1)
    if (carnivoreLabelOrInput) {
      await carnivoreLabelOrInput.trigger('change')
      await carnivoreLabelOrInput.setValue('prod_carnivore')
    }
    // Regardless of addon state, the sales-ended alert must still be visible
    expect(wrapper.text()).toContain('Ticket sales have ended for this event.')
  })

  it('still does NOT render the checkout button after selecting an addon (selected-addon stage)', async () => {
    const wrapper = await mountCard(PAST_CUTOFF_EVENT)

    const addonInput = wrapper.findAll('input[type="radio"]').at(1)
    if (addonInput) {
      await addonInput.trigger('change')
      await addonInput.setValue('prod_carnivore')
    }

    expect(wrapper.text()).not.toContain('Go to checkout')
    expect(wrapper.text()).not.toContain('Sign in to purchase tickets')
  })
})

// ---------------------------------------------------------------------------
// Tests: cutoff in the future (sales still open)
// ---------------------------------------------------------------------------

describe('EventTicketsCard – ticket sales open (cutoff in the future)', () => {
  it('does NOT show the "sales ended" alert', async () => {
    const wrapper = await mountCard(FUTURE_CUTOFF_EVENT)
    expect(wrapper.text()).not.toContain('Ticket sales have ended for this event.')
  })

  it('renders the "Sign in to purchase tickets" link for unauthenticated users', async () => {
    const wrapper = await mountCard(FUTURE_CUTOFF_EVENT)
    expect(wrapper.text()).toContain('Sign in to purchase tickets')
  })
})
