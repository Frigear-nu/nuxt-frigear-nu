import { describe, expect, it } from 'vitest'
import { roleIsHigher, roleIsHigherOrEqual } from '../../shared/acl'

describe('roleComparison', () => {
  const roles = ['highest', 'medium', 'low', 'lowest'] as const
  const highestRole = roles[0]
  const lowestRole = roles[roles.length - 1]

  const falseResultBases = [
    [undefined as never, undefined as never],
    [undefined as never, 'medium'],
    ['medium', undefined as never],
  ]

  const testers = [roleIsHigher, roleIsHigherOrEqual]

  describe('shared', () => {
    for (const tester of testers) {
      it(`${tester.name}: should return false if either role is not provided`, () => {
        for (const [source, compare] of falseResultBases) {
          expect(tester(roles, source, compare)).toBe(false)
        }
      })
    }
  })

  describe('roleIsHigher', () => {
    it('should handle correct hierarchy', () => {
      expect(roleIsHigher(roles, lowestRole, highestRole)).toBe(false)
      expect(roleIsHigher(roles, highestRole, lowestRole)).toBe(true)
      expect(roleIsHigher(roles, highestRole, highestRole)).toBe(false)
    })
  })

  describe('roleIsHigherOrEqual', () => {
    it('should return false if the source is lower than compare', () => {
      expect(roleIsHigherOrEqual(roles, lowestRole, highestRole)).toBe(false)
      expect(roleIsHigherOrEqual(roles, highestRole, lowestRole)).toBe(true)
      expect(roleIsHigherOrEqual(roles, highestRole, highestRole)).toBe(true)
    })
  })
})
