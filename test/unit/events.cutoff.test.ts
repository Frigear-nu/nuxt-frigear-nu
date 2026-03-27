import { describe, it, expect } from 'vitest'
import { getTicketCutoffDate, isTicketSalesEnded } from '../../shared/events/cutoff'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const past = new Date('2020-01-01T00:00:00Z')
const future = new Date('2099-01-01T00:00:00Z')

// A fixed "now" that sits between the two sentinel dates above
const now = new Date('2026-06-01T12:00:00Z')

// ---------------------------------------------------------------------------
// getTicketCutoffDate
// ---------------------------------------------------------------------------

describe('getTicketCutoffDate', () => {
  it('returns null when the event has no relevant dates', () => {
    expect(getTicketCutoffDate({})).toBeNull()
  })

  it('prefers ticketConfig.cutoffDate over event.end and event.start', () => {
    const event = {
      ticketConfig: { cutoffDate: past },
      end: future,
      start: future,
    }
    expect(getTicketCutoffDate(event)).toEqual(past)
  })

  it('falls back to event.end when ticketConfig.cutoffDate is absent', () => {
    const event = { end: future, start: past }
    expect(getTicketCutoffDate(event)).toEqual(future)
  })

  it('falls back to event.start when both ticketConfig.cutoffDate and event.end are absent', () => {
    const event = { start: past }
    expect(getTicketCutoffDate(event)).toEqual(past)
  })

  it('accepts ISO string dates and converts them to Date objects', () => {
    const isoString = '2025-03-21T14:00:00Z'
    const event = { end: isoString }
    const result = getTicketCutoffDate(event)
    expect(result).toBeInstanceOf(Date)
    expect(result!.toISOString()).toBe(new Date(isoString).toISOString())
  })

  it('returns null when cutoffDate, end and start are all null/undefined', () => {
    expect(getTicketCutoffDate({ ticketConfig: { cutoffDate: null }, end: null, start: null })).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// isTicketSalesEnded
// ---------------------------------------------------------------------------

describe('isTicketSalesEnded', () => {
  it('returns false when the event has no dates', () => {
    expect(isTicketSalesEnded({}, now)).toBe(false)
  })

  it('returns true when the cutoff date is in the past', () => {
    expect(isTicketSalesEnded({ end: past }, now)).toBe(true)
  })

  it('returns false when the cutoff date is in the future', () => {
    expect(isTicketSalesEnded({ end: future }, now)).toBe(false)
  })

  it('returns false when now equals the cutoff date exactly (boundary: not strictly after)', () => {
    expect(isTicketSalesEnded({ end: now }, now)).toBe(false)
  })

  it('uses ticketConfig.cutoffDate when provided instead of event.end', () => {
    // cutoffDate is in the past, end is in the future → should be ended
    expect(isTicketSalesEnded({ ticketConfig: { cutoffDate: past }, end: future }, now)).toBe(true)
  })

  it('uses ticketConfig.cutoffDate (future) even when event.end is in the past', () => {
    expect(isTicketSalesEnded({ ticketConfig: { cutoffDate: future }, end: past }, now)).toBe(false)
  })

  it('falls back to event.start when event.end is absent', () => {
    expect(isTicketSalesEnded({ start: past }, now)).toBe(true)
    expect(isTicketSalesEnded({ start: future }, now)).toBe(false)
  })

  it('accepts ISO string dates', () => {
    expect(isTicketSalesEnded({ end: '2020-01-01T00:00:00Z' }, now)).toBe(true)
    expect(isTicketSalesEnded({ end: '2099-01-01T00:00:00Z' }, now)).toBe(false)
  })
})
