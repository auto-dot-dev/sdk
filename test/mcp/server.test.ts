import { describe, it, expect, vi } from 'vitest'
import { createMcpServer, TOOL_DEFINITIONS } from '../../src/mcp/server'

describe('MCP Server', () => {
  it('exports createMcpServer function', () => {
    expect(typeof createMcpServer).toBe('function')
  })

  it('defines 12 tools', () => {
    expect(TOOL_DEFINITIONS).toHaveLength(12)
  })

  it('all tools have name, description, and inputSchema', () => {
    for (const tool of TOOL_DEFINITIONS) {
      expect(tool.name).toBeTruthy()
      expect(tool.description).toBeTruthy()
      expect(tool.inputSchema).toBeTruthy()
    }
  })

  it('tool names use underscore convention', () => {
    const names = TOOL_DEFINITIONS.map((t) => t.name)
    expect(names).toContain('auto_decode')
    expect(names).toContain('auto_photos')
    expect(names).toContain('auto_listings')
    expect(names).toContain('auto_specs')
    expect(names).toContain('auto_build')
    expect(names).toContain('auto_recalls')
    expect(names).toContain('auto_payments')
    expect(names).toContain('auto_apr')
    expect(names).toContain('auto_tco')
    expect(names).toContain('auto_open_recalls')
    expect(names).toContain('auto_plate')
    expect(names).toContain('auto_taxes')
  })

  it('auto_decode tool requires vin param', () => {
    const decode = TOOL_DEFINITIONS.find((t) => t.name === 'auto_decode')!
    expect(decode.inputSchema.properties).toHaveProperty('vin')
    expect(decode.inputSchema.required).toContain('vin')
  })

  it('auto_listings tool has optional filter params', () => {
    const listings = TOOL_DEFINITIONS.find((t) => t.name === 'auto_listings')!
    expect(listings.inputSchema.properties).toHaveProperty('make')
    expect(listings.inputSchema.properties).toHaveProperty('price')
  })

  it('auto_listings tool has correct shorthand params with API mapping in description', () => {
    const listings = TOOL_DEFINITIONS.find((t) => t.name === 'auto_listings')!
    expect(listings.inputSchema.properties).toHaveProperty('make')
    expect(listings.inputSchema.properties).toHaveProperty('price')
    expect(listings.inputSchema.properties).toHaveProperty('miles')
    expect(listings.inputSchema.properties).not.toHaveProperty('priceMin')
    expect(listings.inputSchema.properties).not.toHaveProperty('priceMax')
    expect(listings.inputSchema.properties).not.toHaveProperty('mileageMax')
    expect(listings.inputSchema.properties).not.toHaveProperty('radius')
    expect(listings.inputSchema.properties.make.description).toContain('vehicle.make')
  })

  it('auto_payments tool has price and zip as required', () => {
    const payments = TOOL_DEFINITIONS.find((t) => t.name === 'auto_payments')!
    expect(payments.inputSchema.required).toContain('vin')
    expect(payments.inputSchema.required).toContain('price')
    expect(payments.inputSchema.required).toContain('zip')
  })

  it('auto_apr tool has year, make, model, zip, creditScore as required', () => {
    const apr = TOOL_DEFINITIONS.find((t) => t.name === 'auto_apr')!
    expect(apr.inputSchema.required).toContain('vin')
    expect(apr.inputSchema.required).toContain('year')
    expect(apr.inputSchema.required).toContain('make')
    expect(apr.inputSchema.required).toContain('model')
    expect(apr.inputSchema.required).toContain('zip')
    expect(apr.inputSchema.required).toContain('creditScore')
  })

  it('auto_plate tool requires state and plate (not number)', () => {
    const plate = TOOL_DEFINITIONS.find((t) => t.name === 'auto_plate')!
    expect(plate.inputSchema.required).toContain('state')
    expect(plate.inputSchema.required).toContain('plate')
    expect(plate.inputSchema.required).not.toContain('number')
  })

  it('auto_taxes tool has all 7 query params plus vin', () => {
    const taxes = TOOL_DEFINITIONS.find((t) => t.name === 'auto_taxes')!
    const props = Object.keys(taxes.inputSchema.properties)
    expect(props).toContain('vin')
    expect(props).toContain('price')
    expect(props).toContain('zip')
    expect(props).toContain('docFee')
    expect(props).toContain('tradeIn')
    expect(props).toContain('rate')
    expect(props).toContain('downPayment')
    expect(props).toContain('months')
  })

  it('auto_tco tool has zip and fromZip', () => {
    const tco = TOOL_DEFINITIONS.find((t) => t.name === 'auto_tco')!
    expect(tco.inputSchema.properties).toHaveProperty('zip')
    expect(tco.inputSchema.properties).toHaveProperty('fromZip')
  })
})
