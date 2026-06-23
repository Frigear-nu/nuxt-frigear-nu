import { describe, expect, it } from 'vitest'
import { roleIsHigher } from '../../shared/acl'

describe('roleIsHigher', () => {
  const roles = ['highest', 'medium', 'low', 'lowest'] as const
  const highestRole = roles[0]
  const lowestRole = roles[roles.length - 1]

  it('should return false if either role is not provided', () => {
    expect(roleIsHigher(roles, undefined as never, undefined as never)).toBe(false)
    expect(roleIsHigher(roles, undefined as never, 'medium')).toBe(false)
    expect(roleIsHigher(roles, 'medium', undefined as never)).toBe(false)
  })

  it('should return false if source is lower than compare ', () => {
    expect(roleIsHigher(roles, lowestRole, highestRole)).toBe(false)
  })

  it('should return true if the source is higher than compare', () => {
    expect(roleIsHigher(roles, highestRole, lowestRole)).toBe(true)
  })
})
