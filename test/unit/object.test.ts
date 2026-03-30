import { describe, expect, it } from 'vitest'
import { objectDot, objectGet, objectSet, objectUndot } from '../../layers/frigear/shared/object'

describe('objectGet', () => {
  it('retrieves a top-level value', () => {
    expect(objectGet({ a: 1 }, 'a')).toBe(1)
  })

  it('retrieves a nested value via dot notation', () => {
    expect(objectGet({ a: { b: 1 } }, 'a.b')).toBe(1)
  })

  it('retrieves a deeply nested value', () => {
    expect(objectGet({ a: { b: { c: 'deep' } } }, 'a.b.c')).toBe('deep')
  })

  it('returns undefined for a missing key', () => {
    expect(objectGet({ a: 1 }, 'b')).toBeUndefined()
  })

  it('returns undefined for a missing nested key', () => {
    expect(objectGet({ a: { b: 1 } }, 'a.c')).toBeUndefined()
  })

  it('returns undefined when obj is null', () => {
    expect(objectGet(null as never, 'a')).toBeUndefined()
  })

  it('returns undefined when path is empty', () => {
    expect(objectGet({ a: 1 }, '')).toBeUndefined()
  })

  it('returns undefined when traversing a non-object intermediate value', () => {
    expect(objectGet({ a: 1 }, 'a.b')).toBeUndefined()
  })
})

describe('objectSet', () => {
  it('sets a top-level key', () => {
    expect(objectSet({}, 'a', 1)).toEqual({ a: 1 })
  })

  it('sets a nested key', () => {
    expect(objectSet({ a: { b: 1 } }, 'a.b', 2)).toEqual({ a: { b: 2 } })
  })

  it('creates intermediate objects when missing', () => {
    expect(objectSet({}, 'a.b.c', true)).toEqual({ a: { b: { c: true } } })
  })

  it('mutates and returns the same object reference', () => {
    const obj = { a: 1 }
    const result = objectSet(obj, 'a', 2)
    expect(result).toBe(obj)
    expect(obj.a).toBe(2)
  })

  it('overwrites a non-object intermediate with an object', () => {
    const obj = { a: 1 } as Record<string, unknown>
    objectSet(obj, 'a.b', 'value')
    expect(obj).toEqual({ a: { b: 'value' } })
  })
})

describe('objectDot', () => {
  it('flattens a nested object with dot-separated keys', () => {
    expect(objectDot({ some: { path: true } })).toEqual({ 'some.path': true })
  })

  it('handles a flat object (no nesting)', () => {
    expect(objectDot({ a: 1, b: 2 })).toEqual({ a: 1, b: 2 })
  })

  it('handles deeply nested objects', () => {
    expect(objectDot({ a: { b: { c: 3 } } })).toEqual({ 'a.b.c': 3 })
  })

  it('does not recurse into arrays', () => {
    expect(objectDot({ a: [1, 2, 3] })).toEqual({ a: [1, 2, 3] })
  })

  it('supports a custom separator', () => {
    expect(objectDot({ a: { b: 1 } }, '', '/')).toEqual({ 'a/b': 1 })
  })

  it('supports a custom prefix', () => {
    expect(objectDot({ b: 1 }, 'a')).toEqual({ 'a.b': 1 })
  })
})

describe('objectUndot', () => {
  it('unflattens a dotted object back to nested', () => {
    expect(objectUndot({ 'some.path': true })).toEqual({ some: { path: true } })
  })

  it('handles a flat (non-dotted) object', () => {
    expect(objectUndot({ a: 1, b: 2 })).toEqual({ a: 1, b: 2 })
  })

  it('handles deeply dotted keys', () => {
    expect(objectUndot({ 'a.b.c': 3 })).toEqual({ a: { b: { c: 3 } } })
  })

  it('is the inverse of objectDot for plain objects', () => {
    const original = { a: { b: { c: 42 } }, x: { y: 'hello' } }
    expect(objectUndot(objectDot(original))).toEqual(original)
  })
})
