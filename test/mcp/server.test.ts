import { describe, it, expect, vi } from 'vitest'
import { createMcpServer, TOOL_DEFINITIONS } from '../../src/mcp/server'

describe('MCP Server', () => {
  it('exports createMcpServer function', () => {
    expect(typeof createMcpServer).toBe('function')
  })

  it('defines 12 tools (no usage tool in MCP)', () => {
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
    expect(listings.inputSchema.properties).toHaveProperty('year')
    expect(listings.inputSchema.properties).toHaveProperty('zip')
  })

  it('auto_plate tool requires state and number', () => {
    const plate = TOOL_DEFINITIONS.find((t) => t.name === 'auto_plate')!
    expect(plate.inputSchema.required).toContain('state')
    expect(plate.inputSchema.required).toContain('number')
  })
})
