import { describe, it, expect, vi } from 'vitest'
import { z } from 'zod'
import { handleError, registerApiTool, registerApiTools, type McpToolDef } from '../../src/mcp/factory'
import { AutoDevError } from '../../src/errors'

// Minimal mock for McpServer
function createMockServer() {
  const tools: { name: string; config: any; handler: Function }[] = []
  return {
    registerTool(name: string, config: any, handler: Function) {
      tools.push({ name, config, handler })
    },
    tools,
  }
}

// Minimal mock for AutoDevClient
function createMockClient(response: unknown = { data: { result: 'ok' } }) {
  return {
    request: vi.fn().mockResolvedValue(response),
  }
}

describe('handleError', () => {
  it('formats PLAN_REQUIRED error with upgrade link', () => {
    const err = new AutoDevError(402, 'PLAN_REQUIRED', 'Upgrade required', 'This endpoint requires a Growth plan. Upgrade at https://auto.dev/pricing')
    const result = handleError(err, 'specs')
    expect(result.content[0].text).toContain('requires a Growth plan')
    expect(result.content[0].text).toContain('https://auto.dev/pricing')
  })

  it('formats generic AutoDevError', () => {
    const err = new AutoDevError(404, 'NOT_FOUND', 'VIN not found')
    const result = handleError(err, 'decode')
    expect(result.content[0].text).toContain('404')
    expect(result.content[0].text).toContain('VIN not found')
  })

  it('formats unknown errors', () => {
    const err = new Error('Network failure')
    const result = handleError(err)
    expect(result.content[0].text).toContain('Network failure')
  })
})

describe('registerApiTool', () => {
  it('registers a simple VIN tool with correct name and description', () => {
    const server = createMockServer()
    const client = createMockClient()
    const def: McpToolDef = { endpoint: 'decode', params: { vin: z.string() } }

    registerApiTool(server as any, client as any, def)

    expect(server.tools).toHaveLength(1)
    expect(server.tools[0].name).toBe('auto_decode')
    expect(server.tools[0].config.description).toBe('Decode a VIN — returns make, model, year, trim, engine, drivetrain')
  })

  it('handler calls client.request with positional vin param', async () => {
    const server = createMockServer()
    const client = createMockClient({ data: { make: 'Toyota' } })
    const def: McpToolDef = { endpoint: 'decode', params: { vin: z.string() } }

    registerApiTool(server as any, client as any, def)
    const result = await server.tools[0].handler({ vin: '1234' })

    expect(client.request).toHaveBeenCalledWith('decode', { vin: '1234', query: {} })
    expect(result.content[0].text).toBe(JSON.stringify({ make: 'Toyota' }))
  })

  it('handler builds query from non-positional params', async () => {
    const server = createMockServer()
    const client = createMockClient({ data: {} })
    const def: McpToolDef = {
      endpoint: 'tco',
      params: { vin: z.string(), zip: z.string().optional(), fromZip: z.string().optional() },
    }

    registerApiTool(server as any, client as any, def)
    await server.tools[0].handler({ vin: 'ABC', zip: '90210' })

    expect(client.request).toHaveBeenCalledWith('tco', { vin: 'ABC', query: { zip: '90210' } })
  })

  it('handler applies queryMap for field name remapping', async () => {
    const server = createMockServer()
    const client = createMockClient({ data: [] })
    const def: McpToolDef = {
      endpoint: 'listings',
      params: { make: z.string().optional() },
      queryMap: { make: 'vehicle.make' },
    }

    registerApiTool(server as any, client as any, def)
    await server.tools[0].handler({ make: 'Toyota' })

    expect(client.request).toHaveBeenCalledWith('listings', { query: { 'vehicle.make': 'Toyota' } })
  })

  it('handler returns error result on failure', async () => {
    const server = createMockServer()
    const client = createMockClient()
    client.request = vi.fn().mockRejectedValue(new Error('timeout'))
    const def: McpToolDef = { endpoint: 'decode', params: { vin: z.string() } }

    registerApiTool(server as any, client as any, def)
    const result = await server.tools[0].handler({ vin: '1234' })

    expect(result.content[0].text).toContain('timeout')
  })
})

describe('registerApiTools', () => {
  it('registers multiple tools', () => {
    const server = createMockServer()
    const client = createMockClient()
    const defs: McpToolDef[] = [
      { endpoint: 'decode', params: { vin: z.string() } },
      { endpoint: 'photos', params: { vin: z.string() } },
    ]

    registerApiTools(server as any, client as any, defs)

    expect(server.tools).toHaveLength(2)
    expect(server.tools[0].name).toBe('auto_decode')
    expect(server.tools[1].name).toBe('auto_photos')
  })
})
