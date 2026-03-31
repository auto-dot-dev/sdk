import { describe, it, expect } from 'vitest'
import { AutoDevError } from '../src/errors'

describe('AutoDevError', () => {
  it('creates error with all fields', () => {
    const error = new AutoDevError(403, 'PLAN_REQUIRED', 'Growth plan required', 'Upgrade at auto.dev/pricing')

    expect(error).toBeInstanceOf(Error)
    expect(error.status).toBe(403)
    expect(error.code).toBe('PLAN_REQUIRED')
    expect(error.message).toBe('Growth plan required')
    expect(error.suggestion).toBe('Upgrade at auto.dev/pricing')
    expect(error.name).toBe('AutoDevError')
  })

  it('creates error without suggestion', () => {
    const error = new AutoDevError(404, 'NOT_FOUND', 'Vehicle not found')

    expect(error.suggestion).toBeUndefined()
  })

  it('serializes to JSON with all fields', () => {
    const error = new AutoDevError(429, 'RATE_LIMITED', 'Too many requests', 'Wait and retry')
    const json = JSON.parse(JSON.stringify(error))

    expect(json.status).toBe(429)
    expect(json.code).toBe('RATE_LIMITED')
    expect(json.message).toBe('Too many requests')
    expect(json.suggestion).toBe('Wait and retry')
  })
})
