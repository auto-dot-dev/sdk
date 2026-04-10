import { describe, it, expect } from 'vitest'
import { formatOutput, colorizeJson } from '../../src/cli/factory'

describe('formatOutput', () => {
  it('returns raw JSON for json format', () => {
    const data = { make: 'Toyota', model: 'Camry' }
    const result = formatOutput(data, 'json')
    expect(result).toBe(JSON.stringify(data, null, 2))
    // Should NOT contain ANSI codes
    expect(result).not.toContain('\x1b[')
  })

  it('returns YAML for yaml format', () => {
    const data = { make: 'Toyota', year: 2024 }
    const result = formatOutput(data, 'yaml')
    expect(result).toContain('make: Toyota')
    expect(result).toContain('year: 2024')
  })

  it('returns (no results) for empty array', () => {
    expect(formatOutput([], 'table')).toBe('(no results)')
  })

  it('returns table for flat array data', () => {
    const data = [
      { name: 'Alice', age: '30' },
      { name: 'Bob', age: '25' },
    ]
    const result = formatOutput(data, 'table')
    expect(result).toContain('name')
    expect(result).toContain('age')
    expect(result).toContain('Alice')
    expect(result).toContain('Bob')
  })

  it('returns colorized JSON for array with nested objects', () => {
    const data = [
      { vin: '123', vehicle: { make: 'Toyota', model: 'Camry' } },
    ]
    const result = formatOutput(data, 'table')
    // Should NOT contain [object Object]
    expect(result).not.toContain('[object Object]')
    // Should contain the nested values
    expect(result).toContain('Toyota')
    expect(result).toContain('Camry')
  })

  it('returns colorized JSON for plain objects', () => {
    const data = { make: 'Toyota', model: 'Camry' }
    const result = formatOutput(data, 'table')
    expect(result).toContain('Toyota')
    expect(result).toContain('Camry')
  })

  it('treats null values in array as flat (not nested)', () => {
    const data = [
      { vin: '123', history: null },
    ]
    const result = formatOutput(data, 'table')
    // null is not a nested object, so should be table format
    expect(result).toContain('vin')
    expect(result).toContain('history')
    expect(result).toContain('123')
  })
})

describe('colorizeJson', () => {
  it('colorizes keys', () => {
    const json = JSON.stringify({ make: 'Toyota' }, null, 2)
    const result = colorizeJson(json)
    // Should contain ANSI codes (cyan for keys)
    expect(result).toContain('\x1b[')
    expect(result).toContain('make')
  })

  it('colorizes string values', () => {
    const json = JSON.stringify({ make: 'Toyota' }, null, 2)
    const result = colorizeJson(json)
    expect(result).toContain('Toyota')
  })

  it('colorizes numbers', () => {
    const json = JSON.stringify({ year: 2024 }, null, 2)
    const result = colorizeJson(json)
    expect(result).toContain('2024')
  })

  it('colorizes booleans', () => {
    const json = JSON.stringify({ online: true }, null, 2)
    const result = colorizeJson(json)
    expect(result).toContain('true')
  })

  it('colorizes null', () => {
    const json = JSON.stringify({ history: null }, null, 2)
    const result = colorizeJson(json)
    expect(result).toContain('null')
  })

  it('colorizes URLs differently from regular strings', () => {
    const json = JSON.stringify({ url: 'https://api.auto.dev/test' }, null, 2)
    const result = colorizeJson(json)
    expect(result).toContain('https://api.auto.dev/test')
  })
})
