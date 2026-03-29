type EventWithCutoff = {
  ticketConfig?: { cutoffDate?: Date | string | null } | null
  end?: Date | string | null
  start?: Date | string | null
}

/**
 * Returns the effective ticket-sales cutoff date for an event.
 * Resolution order: ticketConfig.cutoffDate → event.end → event.start
 */
export const getTicketCutoffDate = (event: EventWithCutoff): Date | null => {
  const raw = event.ticketConfig?.cutoffDate ?? event.end ?? event.start ?? null
  if (!raw) return null
  return raw instanceof Date ? raw : new Date(raw)
}

/**
 * Returns true when ticket sales are no longer allowed for the given event.
 * An optional `now` argument (defaults to the current time) lets callers
 * inject a fixed instant – useful for testing.
 */
export const isTicketSalesEnded = (event: EventWithCutoff, now: Date = new Date()): boolean => {
  const cutoff = getTicketCutoffDate(event)
  return cutoff !== null && now > cutoff
}
