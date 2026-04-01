import { describe, it, expect } from 'vitest'
import { getExploreOutput, getEndpointDetail } from '../../src/cli/explore'

describe('Explore Command', () => {
  it('getExploreOutput returns all 13 endpoints', () => {
    const output = getExploreOutput()
    expect(output).toHaveLength(13)
  })

  it('each entry has name, tier, description, path', () => {
    const output = getExploreOutput()
    for (const entry of output) {
      expect(entry.name).toBeTruthy()
      expect(entry.tier).toBeTruthy()
      expect(entry.description).toBeTruthy()
      expect(entry.path).toBeTruthy()
    }
  })

  it('filters by plan tier', () => {
    const starter = getExploreOutput('starter')
    expect(starter.every((e) => e.tier === 'starter')).toBe(true)
    expect(starter.length).toBeGreaterThan(0)
  })

  it('getEndpointDetail returns full detail for a named endpoint', () => {
    const detail = getEndpointDetail('decode')
    expect(detail).toBeDefined()
    expect(detail!.name).toBe('decode')
    expect(detail!.tier).toBe('starter')
    expect(detail!.path).toBe('/vin/{vin}')
    expect(detail!.parameters).toBeDefined()
  })

  it('getEndpointDetail returns null for unknown endpoint', () => {
    const detail = getEndpointDetail('nonexistent')
    expect(detail).toBeNull()
  })
})
