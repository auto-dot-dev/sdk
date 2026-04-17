// src/mcp/server.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { AutoDevClient } from '../core/client.js'
import { loadConfig, saveConfig } from '../core/config.js'
import { getDoc, listDocs, searchDocs } from '../docs/search.js'
import { type McpToolDef, registerApiTools, type ToolDefinition, toToolDefinitions } from './factory.js'

// ── API Tool Declarations ─────────────────────────────────────────────

const API_TOOLS: McpToolDef[] = [
  // Simple VIN-only
  { endpoint: 'decode',      params: { vin: z.string().describe('Vehicle Identification Number') } },
  { endpoint: 'photos',      params: { vin: z.string().describe('Vehicle Identification Number') } },
  { endpoint: 'specs',       params: { vin: z.string().describe('Vehicle Identification Number') } },
  { endpoint: 'build',       params: { vin: z.string().describe('Vehicle Identification Number') } },
  { endpoint: 'recalls',     params: { vin: z.string().describe('Vehicle Identification Number') } },
  { endpoint: 'openRecalls', name: 'auto_open_recalls', params: { vin: z.string().describe('Vehicle Identification Number') } },

  // VIN + query params (pass-through keys)
  { endpoint: 'payments', params: {
    vin: z.string().describe('Vehicle Identification Number'),
    price: z.string().describe('Vehicle sales price'),
    zip: z.string().describe('5-digit ZIP code for tax/fee calculations'),
    downPayment: z.string().optional().describe('Down payment amount'),
    loanTerm: z.string().optional().describe('Loan term in months'),
    docFee: z.string().optional().describe('Dealer documentation fee'),
    tradeIn: z.string().optional().describe('Trade-in vehicle value'),
  }},
  { endpoint: 'apr', params: {
    vin: z.string().describe('Vehicle Identification Number'),
    year: z.string().describe('Model year of the vehicle'),
    make: z.string().describe('Vehicle manufacturer'),
    model: z.string().describe('Vehicle model name'),
    zip: z.string().describe('5-digit ZIP code'),
    creditScore: z.string().describe('Credit score for rate calculation'),
    vehicleAge: z.string().optional().describe('Age of the vehicle in years'),
    vehicleMileage: z.string().optional().describe('Current vehicle mileage'),
  }},
  { endpoint: 'tco', params: {
    vin: z.string().describe('Vehicle Identification Number'),
    zip: z.string().optional().describe('5-digit ZIP code'),
    fromZip: z.string().optional().describe('ZIP code for delivery/transport calculations'),
  }},
  { endpoint: 'taxes', params: {
    vin: z.string().describe('Vehicle Identification Number'),
    price: z.string().optional().describe('Vehicle price (default 25000)'),
    zip: z.string().optional().describe('ZIP code for tax jurisdiction (default 94020)'),
    docFee: z.string().optional().describe('Documentation fee (default 200)'),
    tradeIn: z.string().optional().describe('Trade-in value (default 0)'),
    rate: z.string().optional().describe('Interest rate (default 9.99)'),
    downPayment: z.string().optional().describe('Down payment amount (default 0)'),
    months: z.string().optional().describe('Loan term in months (default 72)'),
  }},

  // Multi-arg (no VIN)
  { endpoint: 'plate', params: {
    state: z.string().describe('Two-letter state abbreviation'),
    plate: z.string().describe('License plate number'),
  }},

  // Query params with field mapping
  { endpoint: 'listings', params: {
    make: z.string().optional().describe('Vehicle manufacturer (maps to vehicle.make)'),
    model: z.string().optional().describe('Vehicle model (maps to vehicle.model)'),
    year: z.string().optional().describe('Year or range, e.g. 2018-2020 (maps to vehicle.year)'),
    trim: z.string().optional().describe('Trim level (maps to vehicle.trim)'),
    bodyStyle: z.string().optional().describe('Body style, e.g. sedan, coupe (maps to vehicle.bodyStyle)'),
    price: z.string().optional().describe('Price range, e.g. 10000-30000 (maps to retailListing.price)'),
    miles: z.string().optional().describe('Mileage range, e.g. 0-50000 (maps to retailListing.miles)'),
    state: z.string().optional().describe('State code, e.g. CA (maps to retailListing.state)'),
    sort: z.string().optional().describe('Sort criteria, e.g. price:asc'),
    page: z.string().optional().describe('Page number'),
    limit: z.string().optional().describe('Results per page (1-100)'),
  }, queryMap: {
    make: 'vehicle.make', model: 'vehicle.model', year: 'vehicle.year',
    trim: 'vehicle.trim', bodyStyle: 'vehicle.bodyStyle',
    price: 'retailListing.price', miles: 'retailListing.miles',
    state: 'retailListing.state',
  }},
]

// ── TOOL_DEFINITIONS export (used by remote MCP server) ───────────────

const NON_API_TOOL_DEFS: ToolDefinition[] = [
  {
    name: 'auto_docs',
    description: 'Search auto.dev API documentation. Returns relevant docs for a query or specific endpoint name.',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string', description: 'Search query or endpoint name (e.g. "listings", "payments", "VIN decode")' } },
      required: ['query'],
    },
  },
  {
    name: 'auto_config_set',
    description: 'Set a config value (e.g. raw: true to show full API responses)',
    inputSchema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'Config key (e.g. "raw")' },
        value: { type: 'string', description: 'Config value (e.g. "true" or "false")' },
      },
      required: ['key', 'value'],
    },
  },
  {
    name: 'auto_config_get',
    description: 'Get a config value or list all config settings',
    inputSchema: {
      type: 'object',
      properties: { key: { type: 'string', description: 'Config key to read (omit for all settings)' } },
      required: [],
    },
  },
]

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  ...toToolDefinitions(API_TOOLS),
  ...NON_API_TOOL_DEFS,
]

// ── Server ────────────────────────────────────────────────────────────

export interface McpServerOptions {
  apiKey: string | (() => Promise<string>)
  baseUrl?: string
}

export function createMcpServer(options: McpServerOptions): McpServer {
  const client = new AutoDevClient({ ...options, clientType: 'mcp-stdio' })
  const server = new McpServer({
    name: 'auto.dev',
    version: '1.0.0',
  })

  // Register all API tools via factory
  registerApiTools(server, client, API_TOOLS)

  // Hand-written tools
  server.registerTool('auto_docs', {
    description: 'Search auto.dev API documentation. Returns relevant docs for a query or specific endpoint name.',
    inputSchema: {
      query: z.string().describe('Search query or endpoint name (e.g. "listings", "payments", "VIN decode")'),
    },
  }, async ({ query }) => {
    const exact = getDoc(query)
    if (exact) {
      return { content: [{ type: 'text', text: exact }] }
    }

    const results = searchDocs(query)
    if (results.length === 0) {
      const available = listDocs().join(', ')
      return { content: [{ type: 'text', text: `No docs found for "${query}". Available: ${available}` }] }
    }

    const top = results[0]!
    const others = results.slice(1).map((r) => r.name).join(', ')
    let text = top.content
    if (others) {
      text += `\n\n---\nAlso related: ${others}`
    }
    return { content: [{ type: 'text', text }] }
  })

  server.registerTool('auto_config_set', {
    description: 'Set a config value (e.g. raw: true to show full API responses)',
    inputSchema: {
      key: z.string().describe('Config key (e.g. "raw")'),
      value: z.string().describe('Config value (e.g. "true" or "false")'),
    },
  }, async ({ key, value: val }) => {
    const parsed = val === 'true' ? true : val === 'false' ? false : val
    saveConfig({ [key]: parsed })
    return { content: [{ type: 'text', text: `Config "${key}" set to ${parsed}` }] }
  })

  server.registerTool('auto_config_get', {
    description: 'Get a config value or list all config settings',
    inputSchema: {
      key: z.string().optional().describe('Config key to read (omit for all settings)'),
    },
  }, async ({ key }) => {
    const config = loadConfig()
    if (key) {
      const val = (config as Record<string, unknown>)[key]
      return { content: [{ type: 'text', text: val !== undefined ? `${key}: ${val}` : `${key} is not set` }] }
    }
    return { content: [{ type: 'text', text: JSON.stringify(config, null, 2) }] }
  })

  return server
}

export async function startMcpServer(options: McpServerOptions): Promise<void> {
  const server = createMcpServer(options)
  const transport = new StdioServerTransport()
  await server.connect(transport)
}
