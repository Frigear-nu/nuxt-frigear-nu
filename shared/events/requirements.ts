import type { EventsCollectionItem } from '@nuxt/content'

export const checkTicketRequirements = (
  ticket: EventsCollectionItem['tickets'][string],
  userMemberships: { priceId: string }[],
) => {
  const checks = ticket.requirements.map((requirement: EventsCollectionItem['tickets'][string]['requirements'][number]) => {
    if (requirement.type === 'membership') {
      return checkTicketMembershipRequirement(requirement, userMemberships)
    }

    return {
      ...requirement,
      pass: true,
    }
  })

  const passedChecks = checks.filter(check => check.pass)
  const failedChecks = checks.filter(check => !check.pass)

  return {
    failed: failedChecks,
    passed: passedChecks,
    success: passedChecks.length === checks.length,
  }
}

export const checkTicketMembershipRequirement = (
  requirement: EventsCollectionItem['tickets'][string]['requirements'][number],
  userMemberships: { priceId: string }[],
) => {
  return {
    ...requirement,
    pass: userMemberships.some((m) => {
      if (requirement.method === 'any') {
        return userMemberships.length > 0
      }

      if (requirement.method === 'one_of') {
        return requirement.priceIds.includes(m.priceId)
      }

      return true
    }),
  }
}
