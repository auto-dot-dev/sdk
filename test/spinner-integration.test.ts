import { describe, it, expect } from 'vitest'
import { shouldSuppressSpinner } from '../src/cli/commands'

describe('spinner suppression', () => {
  it('shouldSuppressSpinner returns true for json format', () => {
    expect(shouldSuppressSpinner({ json: true })).toBe(true)
  })

  it('shouldSuppressSpinner returns true for yaml format', () => {
    expect(shouldSuppressSpinner({ yaml: true })).toBe(true)
  })

  it('shouldSuppressSpinner returns true for raw flag', () => {
    expect(shouldSuppressSpinner({ raw: true })).toBe(true)
  })

  it('shouldSuppressSpinner returns false for default (table) format', () => {
    expect(shouldSuppressSpinner({})).toBe(false)
  })
})
