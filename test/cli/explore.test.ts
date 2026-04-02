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

  it('listings params match docs.auto.dev with API mapping', () => {
    const detail = getEndpointDetail('listings')!
    const paramNames = detail.parameters.map((p) => p.name)
    expect(paramNames).toContain('make')
    expect(paramNames).toContain('model')
    expect(paramNames).toContain('year')
    expect(paramNames).toContain('price')
    expect(paramNames).toContain('miles')
    expect(paramNames).toContain('state')
    const makeParam = detail.parameters.find((p) => p.name === 'make')!
    expect(makeParam.apiParam).toBe('vehicle.make')
  })

  it('payments params include price and zip as required', () => {
    const detail = getEndpointDetail('payments')!
    const price = detail.parameters.find((p) => p.name === 'price')!
    expect(price.required).toBe(true)
    const zip = detail.parameters.find((p) => p.name === 'zip')!
    expect(zip.required).toBe(true)
    const downPayment = detail.parameters.find((p) => p.name === 'downPayment')!
    expect(downPayment.required).toBe(false)
  })

  it('apr params include required year, make, model, zip, creditScore', () => {
    const detail = getEndpointDetail('apr')!
    for (const name of ['year', 'make', 'model', 'zip', 'creditScore']) {
      const param = detail.parameters.find((p) => p.name === name)!
      expect(param.required).toBe(true)
    }
  })

  it('plate params use plate not number', () => {
    const detail = getEndpointDetail('plate')!
    const paramNames = detail.parameters.map((p) => p.name)
    expect(paramNames).toContain('plate')
    expect(paramNames).not.toContain('number')
  })

  it('tco params include zip and fromZip', () => {
    const detail = getEndpointDetail('tco')!
    const paramNames = detail.parameters.map((p) => p.name)
    expect(paramNames).toContain('zip')
    expect(paramNames).toContain('fromZip')
  })

  it('taxes params include all 7 query params', () => {
    const detail = getEndpointDetail('taxes')!
    expect(detail.parameters.filter((p) => p.in === 'query')).toHaveLength(7)
  })
})
