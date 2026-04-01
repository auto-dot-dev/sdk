import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { AutoDevClient } from '../core/client.js'
import { ENDPOINTS } from '../core/endpoints.js'

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
        make: { type: 'string', description: 'Vehicle make (e.g. Toyota)' },
        model: { type: 'string', description: 'Vehicle model (e.g. Camry)' },
        year: { type: 'string', description: 'Vehicle year' },
        zip: { type: 'string', description: 'ZIP code for search area' },
        radius: { type: 'string', description: 'Search radius in miles' },
        priceMin: { type: 'string', description: 'Minimum price' },
        priceMax: { type: 'string', description: 'Maximum price' },
        mileageMax: { type: 'string', description: 'Maximum mileage' },
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
        downPayment: { type: 'string', description: 'Down payment amount' },
        loanTerm: { type: 'string', description: 'Loan term in months' },
        creditScore: { type: 'string', description: 'Credit score' },
      },
      required: ['vin'],
    },
  },
  {
    name: 'auto_apr',
    description: ENDPOINTS.apr.description,
    inputSchema: {
      type: 'object',
      properties: {
        vin: { type: 'string', description: 'Vehicle Identification Number' },
        creditScore: { type: 'string', description: 'Credit score' },
      },
      required: ['vin'],
    },
  },
  {
    name: 'auto_tco',
    description: ENDPOINTS.tco.description,
    inputSchema: {
      type: 'object',
      properties: {
        vin: { type: 'string', description: 'Vehicle Identification Number' },
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
        number: { type: 'string', description: 'License plate number' },
      },
      required: ['state', 'number'],
    },
  },
  {
    name: 'auto_taxes',
    description: ENDPOINTS.taxes.description,
    inputSchema: {
      type: 'object',
      properties: {
        vin: { type: 'string', description: 'Vehicle Identification Number' },
        zip: { type: 'string', description: 'ZIP code for tax calculation' },
      },
      required: ['vin', 'zip'],
    },
  },
]

const TOOL_TO_ENDPOINT: Record<string, string> = {
  auto_decode: 'decode',
  auto_photos: 'photos',
  auto_listings: 'listings',
  auto_specs: 'specs',
  auto_build: 'build',
  auto_recalls: 'recalls',
  auto_payments: 'payments',
  auto_apr: 'apr',
  auto_tco: 'tco',
  auto_open_recalls: 'openRecalls',
  auto_plate: 'plate',
  auto_taxes: 'taxes',
}

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

  // auto_decode
  server.tool(
    'auto_decode',
    ENDPOINTS.decode.description,
    { vin: z.string().describe('Vehicle Identification Number') },
    async ({ vin }) => {
      const data = await client.request('decode', { vin })
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    }
  )

  // auto_photos
  server.tool(
    'auto_photos',
    ENDPOINTS.photos.description,
    { vin: z.string().describe('Vehicle Identification Number') },
    async ({ vin }) => {
      const data = await client.request('photos', { vin })
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    }
  )

  // auto_listings
  server.tool(
    'auto_listings',
    ENDPOINTS.listings.description,
    {
      make: z.string().optional().describe('Vehicle make'),
      model: z.string().optional().describe('Vehicle model'),
      year: z.string().optional().describe('Vehicle year'),
      zip: z.string().optional().describe('ZIP code'),
      radius: z.string().optional().describe('Search radius in miles'),
      priceMin: z.string().optional().describe('Minimum price'),
      priceMax: z.string().optional().describe('Maximum price'),
      mileageMax: z.string().optional().describe('Maximum mileage'),
    },
    async (args) => {
      const data = await client.request('listings', args)
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    }
  )

  // auto_specs
  server.tool(
    'auto_specs',
    ENDPOINTS.specs.description,
    { vin: z.string().describe('Vehicle Identification Number') },
    async ({ vin }) => {
      const data = await client.request('specs', { vin })
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    }
  )

  // auto_build
  server.tool(
    'auto_build',
    ENDPOINTS.build.description,
    { vin: z.string().describe('Vehicle Identification Number') },
    async ({ vin }) => {
      const data = await client.request('build', { vin })
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    }
  )

  // auto_recalls
  server.tool(
    'auto_recalls',
    ENDPOINTS.recalls.description,
    { vin: z.string().describe('Vehicle Identification Number') },
    async ({ vin }) => {
      const data = await client.request('recalls', { vin })
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    }
  )

  // auto_payments
  server.tool(
    'auto_payments',
    ENDPOINTS.payments.description,
    {
      vin: z.string().describe('Vehicle Identification Number'),
      downPayment: z.string().optional().describe('Down payment amount'),
      loanTerm: z.string().optional().describe('Loan term in months'),
      creditScore: z.string().optional().describe('Credit score'),
    },
    async ({ vin, downPayment, loanTerm, creditScore }) => {
      const data = await client.request('payments', { vin, downPayment, loanTerm, creditScore })
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    }
  )

  // auto_apr
  server.tool(
    'auto_apr',
    ENDPOINTS.apr.description,
    {
      vin: z.string().describe('Vehicle Identification Number'),
      creditScore: z.string().optional().describe('Credit score'),
    },
    async ({ vin, creditScore }) => {
      const data = await client.request('apr', { vin, creditScore })
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    }
  )

  // auto_tco
  server.tool(
    'auto_tco',
    ENDPOINTS.tco.description,
    { vin: z.string().describe('Vehicle Identification Number') },
    async ({ vin }) => {
      const data = await client.request('tco', { vin })
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    }
  )

  // auto_open_recalls
  server.tool(
    'auto_open_recalls',
    ENDPOINTS.openRecalls.description,
    { vin: z.string().describe('Vehicle Identification Number') },
    async ({ vin }) => {
      const data = await client.request('openRecalls', { vin })
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    }
  )

  // auto_plate
  server.tool(
    'auto_plate',
    ENDPOINTS.plate.description,
    {
      state: z.string().describe('Two-letter state abbreviation'),
      number: z.string().describe('License plate number'),
    },
    async ({ state, number }) => {
      const data = await client.request('plate', { state, number })
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    }
  )

  // auto_taxes
  server.tool(
    'auto_taxes',
    ENDPOINTS.taxes.description,
    {
      vin: z.string().describe('Vehicle Identification Number'),
      zip: z.string().describe('ZIP code for tax calculation'),
    },
    async ({ vin, zip }) => {
      const data = await client.request('taxes', { vin, zip })
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    }
  )

  return server
}

export async function startMcpServer(options: McpServerOptions): Promise<void> {
  const server = createMcpServer(options)
  const transport = new StdioServerTransport()
  await server.connect(transport)
}
