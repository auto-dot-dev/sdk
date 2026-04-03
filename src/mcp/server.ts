import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { AutoDevClient } from '../core/client.js'
import { AutoDevError } from '../errors.js'
import { ENDPOINTS } from '../core/endpoints.js'
import { searchDocs, getDoc, listDocs } from '../docs/search.js'

export interface ToolDefinition {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, { type: string; description: string }>
    required: string[]
  }
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'auto_decode',
    description: ENDPOINTS.decode.description,
    inputSchema: {
      type: 'object',
      properties: {
        vin: { type: 'string', description: 'Vehicle Identification Number' },
      },
      required: ['vin'],
    },
  },
  {
    name: 'auto_photos',
    description: ENDPOINTS.photos.description,
    inputSchema: {
      type: 'object',
      properties: {
        vin: { type: 'string', description: 'Vehicle Identification Number' },
      },
      required: ['vin'],
    },
  },
  {
    name: 'auto_listings',
    description: ENDPOINTS.listings.description,
    inputSchema: {
      type: 'object',
      properties: {
        make: { type: 'string', description: 'Vehicle manufacturer (maps to vehicle.make)' },
        model: { type: 'string', description: 'Vehicle model (maps to vehicle.model)' },
        year: { type: 'string', description: 'Year or range, e.g. 2018-2020 (maps to vehicle.year)' },
        trim: { type: 'string', description: 'Trim level (maps to vehicle.trim)' },
        bodyStyle: { type: 'string', description: 'Body style, e.g. sedan, coupe (maps to vehicle.bodyStyle)' },
        price: { type: 'string', description: 'Price range, e.g. 10000-30000 (maps to retailListing.price)' },
        miles: { type: 'string', description: 'Mileage range, e.g. 0-50000 (maps to retailListing.miles)' },
        state: { type: 'string', description: 'State code, e.g. CA (maps to retailListing.state)' },
        sort: { type: 'string', description: 'Sort criteria, e.g. price:asc' },
        page: { type: 'string', description: 'Page number' },
        limit: { type: 'string', description: 'Results per page (1-100)' },
      },
      required: [],
    },
  },
  {
    name: 'auto_specs',
    description: ENDPOINTS.specs.description,
    inputSchema: {
      type: 'object',
      properties: {
        vin: { type: 'string', description: 'Vehicle Identification Number' },
      },
      required: ['vin'],
    },
  },
  {
    name: 'auto_build',
    description: ENDPOINTS.build.description,
    inputSchema: {
      type: 'object',
      properties: {
        vin: { type: 'string', description: 'Vehicle Identification Number' },
      },
      required: ['vin'],
    },
  },
  {
    name: 'auto_recalls',
    description: ENDPOINTS.recalls.description,
    inputSchema: {
      type: 'object',
      properties: {
        vin: { type: 'string', description: 'Vehicle Identification Number' },
      },
      required: ['vin'],
    },
  },
  {
    name: 'auto_payments',
    description: ENDPOINTS.payments.description,
    inputSchema: {
      type: 'object',
      properties: {
        vin: { type: 'string', description: 'Vehicle Identification Number' },
        price: { type: 'string', description: 'Vehicle sales price' },
        zip: { type: 'string', description: '5-digit ZIP code for tax/fee calculations' },
        downPayment: { type: 'string', description: 'Down payment amount' },
        loanTerm: { type: 'string', description: 'Loan term in months' },
        docFee: { type: 'string', description: 'Dealer documentation fee' },
        tradeIn: { type: 'string', description: 'Trade-in vehicle value' },
      },
      required: ['vin', 'price', 'zip'],
    },
  },
  {
    name: 'auto_apr',
    description: ENDPOINTS.apr.description,
    inputSchema: {
      type: 'object',
      properties: {
        vin: { type: 'string', description: 'Vehicle Identification Number' },
        year: { type: 'string', description: 'Model year of the vehicle' },
        make: { type: 'string', description: 'Vehicle manufacturer' },
        model: { type: 'string', description: 'Vehicle model name' },
        zip: { type: 'string', description: '5-digit ZIP code' },
        creditScore: { type: 'string', description: 'Credit score for rate calculation' },
        vehicleAge: { type: 'string', description: 'Age of the vehicle in years' },
        vehicleMileage: { type: 'string', description: 'Current vehicle mileage' },
      },
      required: ['vin', 'year', 'make', 'model', 'zip', 'creditScore'],
    },
  },
  {
    name: 'auto_tco',
    description: ENDPOINTS.tco.description,
    inputSchema: {
      type: 'object',
      properties: {
        vin: { type: 'string', description: 'Vehicle Identification Number' },
        zip: { type: 'string', description: '5-digit ZIP code' },
        fromZip: { type: 'string', description: 'ZIP code for delivery/transport calculations' },
      },
      required: ['vin'],
    },
  },
  {
    name: 'auto_open_recalls',
    description: ENDPOINTS.openRecalls.description,
    inputSchema: {
      type: 'object',
      properties: {
        vin: { type: 'string', description: 'Vehicle Identification Number' },
      },
      required: ['vin'],
    },
  },
  {
    name: 'auto_plate',
    description: ENDPOINTS.plate.description,
    inputSchema: {
      type: 'object',
      properties: {
        state: { type: 'string', description: 'Two-letter state abbreviation' },
        plate: { type: 'string', description: 'License plate number' },
      },
      required: ['state', 'plate'],
    },
  },
  {
    name: 'auto_taxes',
    description: ENDPOINTS.taxes.description,
    inputSchema: {
      type: 'object',
      properties: {
        vin: { type: 'string', description: 'Vehicle Identification Number' },
        price: { type: 'string', description: 'Vehicle price (default 25000)' },
        zip: { type: 'string', description: 'ZIP code for tax jurisdiction (default 94020)' },
        docFee: { type: 'string', description: 'Documentation fee (default 200)' },
        tradeIn: { type: 'string', description: 'Trade-in value (default 0)' },
        rate: { type: 'string', description: 'Interest rate (default 9.99)' },
        downPayment: { type: 'string', description: 'Down payment amount (default 0)' },
        months: { type: 'string', description: 'Loan term in months (default 72)' },
      },
      required: ['vin'],
    },
  },
  {
    name: 'auto_docs',
    description: 'Search auto.dev API documentation. Returns relevant docs for a query or specific endpoint name.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query or endpoint name (e.g. "listings", "payments", "VIN decode")' },
      },
      required: ['query'],
    },
  },
]

export interface McpServerOptions {
  apiKey: string
  baseUrl?: string
}

export function createMcpServer(options: McpServerOptions): McpServer {
  const client = new AutoDevClient(options)
  const server = new McpServer({
    name: 'auto.dev',
    version: '1.0.0',
  })

  // Wrap tool handlers to catch plan errors and return helpful messages
  function handleError(err: unknown, endpoint?: string): { content: { type: 'text'; text: string }[] } {
    if (err instanceof AutoDevError && err.code === 'PLAN_REQUIRED') {
      const name = endpoint ?? 'This endpoint'
      const tierMatch = err.suggestion?.match(/requires a (\w+) plan/)
      const tier = tierMatch?.[1] ?? 'higher'
      const upgradeLink = err.suggestion?.match(/Upgrade at ([^\s|]+)/)?.[1] ?? 'https://auto.dev/pricing'
      const msg = `⚠️ ${name} requires a ${tier} plan\n\n  Upgrade your plan: ${upgradeLink}\n  Manage account:   https://auto.dev/dashboard`
      return { content: [{ type: 'text', text: msg }] }
    }
    if (err instanceof AutoDevError) {
      return { content: [{ type: 'text', text: `Error ${err.status}: ${err.message}${err.suggestion ? `\n\n${err.suggestion}` : ''}` }] }
    }
    return { content: [{ type: 'text', text: `Error: ${(err as Error).message}` }] }
  }

  server.registerTool('auto_decode', {
    description: ENDPOINTS.decode.description,
    inputSchema: { vin: z.string().describe('Vehicle Identification Number') },
  }, async ({ vin }) => {
    try {
      const data = await client.request('decode', { vin })
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    } catch (err) { return handleError(err, 'decode') }
  })

  server.registerTool('auto_photos', {
    description: ENDPOINTS.photos.description,
    inputSchema: { vin: z.string().describe('Vehicle Identification Number') },
  }, async ({ vin }) => {
    try {
      const data = await client.request('photos', { vin })
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    } catch (err) { return handleError(err, 'photos') }
  })

  server.registerTool('auto_listings', {
    description: ENDPOINTS.listings.description,
    inputSchema: {
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
    },
  }, async (args) => {
    try {
      const query: Record<string, string> = {}
      if (args.make) query['vehicle.make'] = args.make
      if (args.model) query['vehicle.model'] = args.model
      if (args.year) query['vehicle.year'] = args.year
      if (args.trim) query['vehicle.trim'] = args.trim
      if (args.bodyStyle) query['vehicle.bodyStyle'] = args.bodyStyle
      if (args.price) query['retailListing.price'] = args.price
      if (args.miles) query['retailListing.miles'] = args.miles
      if (args.state) query['retailListing.state'] = args.state
      if (args.sort) query['sort'] = args.sort
      if (args.page) query['page'] = args.page
      if (args.limit) query['limit'] = args.limit
      const data = await client.request('listings', { query })
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    } catch (err) { return handleError(err, 'listings') }
  })

  server.registerTool('auto_specs', {
    description: ENDPOINTS.specs.description,
    inputSchema: { vin: z.string().describe('Vehicle Identification Number') },
  }, async ({ vin }) => {
    try {
      const data = await client.request('specs', { vin })
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    } catch (err) { return handleError(err, 'specs') }
  })

  server.registerTool('auto_build', {
    description: ENDPOINTS.build.description,
    inputSchema: { vin: z.string().describe('Vehicle Identification Number') },
  }, async ({ vin }) => {
    try {
      const data = await client.request('build', { vin })
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    } catch (err) { return handleError(err, 'build') }
  })

  server.registerTool('auto_recalls', {
    description: ENDPOINTS.recalls.description,
    inputSchema: { vin: z.string().describe('Vehicle Identification Number') },
  }, async ({ vin }) => {
    try {
      const data = await client.request('recalls', { vin })
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    } catch (err) { return handleError(err, 'recalls') }
  })

  server.registerTool('auto_payments', {
    description: ENDPOINTS.payments.description,
    inputSchema: {
      vin: z.string().describe('Vehicle Identification Number'),
      price: z.string().describe('Vehicle sales price'),
      zip: z.string().describe('5-digit ZIP code for tax/fee calculations'),
      downPayment: z.string().optional().describe('Down payment amount'),
      loanTerm: z.string().optional().describe('Loan term in months'),
      docFee: z.string().optional().describe('Dealer documentation fee'),
      tradeIn: z.string().optional().describe('Trade-in vehicle value'),
    },
  }, async ({ vin, ...rest }) => {
    try {
      const query: Record<string, string> = {}
      for (const [k, v] of Object.entries(rest)) {
        if (v !== undefined) query[k] = v
      }
      const data = await client.request('payments', { vin, query })
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    } catch (err) { return handleError(err, 'payments') }
  })

  server.registerTool('auto_apr', {
    description: ENDPOINTS.apr.description,
    inputSchema: {
      vin: z.string().describe('Vehicle Identification Number'),
      year: z.string().describe('Model year of the vehicle'),
      make: z.string().describe('Vehicle manufacturer'),
      model: z.string().describe('Vehicle model name'),
      zip: z.string().describe('5-digit ZIP code'),
      creditScore: z.string().describe('Credit score for rate calculation'),
      vehicleAge: z.string().optional().describe('Age of the vehicle in years'),
      vehicleMileage: z.string().optional().describe('Current vehicle mileage'),
    },
  }, async ({ vin, ...rest }) => {
    try {
      const query: Record<string, string> = {}
      for (const [k, v] of Object.entries(rest)) {
        if (v !== undefined) query[k] = v
      }
      const data = await client.request('apr', { vin, query })
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    } catch (err) { return handleError(err, 'apr') }
  })

  server.registerTool('auto_tco', {
    description: ENDPOINTS.tco.description,
    inputSchema: {
      vin: z.string().describe('Vehicle Identification Number'),
      zip: z.string().optional().describe('5-digit ZIP code'),
      fromZip: z.string().optional().describe('ZIP code for delivery/transport calculations'),
    },
  }, async ({ vin, zip, fromZip }) => {
    try {
      const query: Record<string, string> = {}
      if (zip) query['zip'] = zip
      if (fromZip) query['fromZip'] = fromZip
      const data = await client.request('tco', { vin, query })
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    } catch (err) { return handleError(err, 'tco') }
  })

  server.registerTool('auto_open_recalls', {
    description: ENDPOINTS.openRecalls.description,
    inputSchema: { vin: z.string().describe('Vehicle Identification Number') },
  }, async ({ vin }) => {
    try {
      const data = await client.request('openRecalls', { vin })
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    } catch (err) { return handleError(err, 'open-recalls') }
  })

  server.registerTool('auto_plate', {
    description: ENDPOINTS.plate.description,
    inputSchema: {
      state: z.string().describe('Two-letter state abbreviation'),
      plate: z.string().describe('License plate number'),
    },
  }, async ({ state, plate }) => {
    try {
      const data = await client.request('plate', { state, plate })
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    } catch (err) { return handleError(err, 'plate') }
  })

  server.registerTool('auto_taxes', {
    description: ENDPOINTS.taxes.description,
    inputSchema: {
      vin: z.string().describe('Vehicle Identification Number'),
      price: z.string().optional().describe('Vehicle price (default 25000)'),
      zip: z.string().optional().describe('ZIP code for tax jurisdiction (default 94020)'),
      docFee: z.string().optional().describe('Documentation fee (default 200)'),
      tradeIn: z.string().optional().describe('Trade-in value (default 0)'),
      rate: z.string().optional().describe('Interest rate (default 9.99)'),
      downPayment: z.string().optional().describe('Down payment amount (default 0)'),
      months: z.string().optional().describe('Loan term in months (default 72)'),
    },
  }, async ({ vin, ...rest }) => {
    try {
      const query: Record<string, string> = {}
      for (const [k, v] of Object.entries(rest)) {
        if (v !== undefined) query[k] = v
      }
      const data = await client.request('taxes', { vin, query })
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    } catch (err) { return handleError(err, 'taxes') }
  })

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

  return server
}

export async function startMcpServer(options: McpServerOptions): Promise<void> {
  const server = createMcpServer(options)
  const transport = new StdioServerTransport()
  await server.connect(transport)
}
