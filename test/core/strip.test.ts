import { describe, it, expect } from 'vitest'
import { stripMetadata, resolveRaw, METADATA_KEYS } from '../../src/core/strip'

describe('stripMetadata', () => {
  it('removes all metadata keys', () => {
    const response = {
      api: { name: 'api.auto.dev' },
      links: { home: 'https://api.auto.dev' },
      user: { name: 'Test' },
      examples: { '2020 Kia Soul': 'https://...' },
      discover: { 'Decode': 'https://...' },
      actions: { 'Toggle': 'https://...' },
      make: 'Kia',
      model: 'Soul',
      year: 2020,
    }
    const result = stripMetadata(response)
    expect(result).toEqual({ make: 'Kia', model: 'Soul', year: 2020 })
  })

  it('unwraps single remaining key', () => {
    const response = {
      api: { name: 'api.auto.dev' },
      links: { home: 'https://api.auto.dev' },
      user: { name: 'Test' },
      examples: {},
      discover: {},
      actions: {},
      build: { trim: 'LX', engine: '2.0L' },
    }
    const result = stripMetadata(response)
    expect(result).toEqual({ trim: 'LX', engine: '2.0L' })
  })

  it('returns multiple remaining keys as-is', () => {
    const response = {
      api: { name: 'api.auto.dev' },
      make: 'Ford',
      model: 'Focus',
    }
    const result = stripMetadata(response)
    expect(result).toEqual({ make: 'Ford', model: 'Focus' })
  })

  it('returns empty object when only metadata keys exist', () => {
    const response = {
      api: { name: 'api.auto.dev' },
      links: { home: 'https://api.auto.dev' },
    }
    const result = stripMetadata(response)
    expect(result).toEqual({})
  })

  it('passes through response with no metadata keys unchanged', () => {
    const response = { make: 'Toyota', year: 2022 }
    const result = stripMetadata(response)
    expect(result).toEqual({ make: 'Toyota', year: 2022 })
  })

  it('blocklist contains exactly the expected keys', () => {
    expect(METADATA_KEYS).toEqual(['api', 'links', 'user', 'examples', 'discover', 'actions'])
  })
})

describe('resolveRaw', () => {
  it('returns false by default (stripped)', () => {
    expect(resolveRaw()).toBe(false)
  })

  it('per-request overrides all', () => {
    expect(resolveRaw({ perRequest: true })).toBe(true)
    expect(resolveRaw({ perRequest: false, consumer: true, config: true })).toBe(false)
  })

  it('consumer-level overrides config', () => {
    expect(resolveRaw({ consumer: true })).toBe(true)
    expect(resolveRaw({ consumer: false, config: true })).toBe(false)
  })

  it('config is lowest priority', () => {
    expect(resolveRaw({ config: true })).toBe(true)
    expect(resolveRaw({ config: false })).toBe(false)
  })

  it('skips undefined values in chain', () => {
    expect(resolveRaw({ perRequest: undefined, consumer: undefined, config: true })).toBe(true)
  })
})
