import type { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { AutoDevError } from '../errors'
import { ENDPOINTS } from '../core/endpoints'
import type { AutoDevClient } from '../core/client'

type EndpointDefinition = { description: string; path: string }

export interface McpToolDef {
  endpoint: string
  params: Record<string, z.ZodType>
  queryMap?: Record<string, string>
}

export type McpErrorResult = { content: { type: 'text'; text: string }[] }

const POSITIONAL_PARAMS = new Set(['vin', 'state', 'plate'])

export function registerApiTool(server: McpServer, client: AutoDevClient, def: McpToolDef): void {
  const name = `auto_${def.endpoint}`
  const definition = (ENDPOINTS as Record<string, typeof ENDPOINTS[keyof typeof ENDPOINTS] | undefined>)[def.endpoint]
  if (!definition) {
    throw new Error(`Unknown endpoint: ${def.endpoint}`)
  }

  server.registerTool(name, {
    description: definition.description,
    inputSchema: def.params,
  }, async (args: Record<string, string | undefined>) => {
    try {
      const positional: Record<string, string> = {}
      const query: Record<string, string> = {}

      for (const [key, val] of Object.entries(args)) {
        if (val === undefined) continue
        if (POSITIONAL_PARAMS.has(key)) {
          positional[key] = val
        } else if (def.queryMap?.[key]) {
          query[def.queryMap[key]] = val
        } else {
          query[key] = val
        }
      }

      const { data } = await client.request(def.endpoint, { ...positional, query })
      return { content: [{ type: 'text' as const, text: JSON.stringify(data) }] }
    } catch (err) {
      return handleError(err, def.endpoint)
    }
  })
}

export function registerApiTools(server: McpServer, client: AutoDevClient, defs: McpToolDef[]): void {
  for (const def of defs) {
    registerApiTool(server, client, def)
  }
}

export interface ToolDefinition {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, { type: string; description: string }>
    required: string[]
  }
}

export function toToolDefinitions(defs: McpToolDef[]): ToolDefinition[] {
  return defs.map((def) => {
    const definition = (ENDPOINTS as Record<string, EndpointDefinition | undefined>)[def.endpoint]
    if (!definition) {
      throw new Error(`Unknown endpoint: ${def.endpoint}`)
    }

    const properties: Record<string, { type: string; description: string }> = {}
    const required: string[] = []

    for (const [key, schema] of Object.entries(def.params)) {
      const isOptional = schema.isOptional()
      const description = schema.description ?? key
      properties[key] = { type: 'string', description }
      if (!isOptional) {
        required.push(key)
      }
    }

    return {
      name: `auto_${def.endpoint}`,
      description: definition.description,
      inputSchema: { type: 'object' as const, properties, required },
    }
  })
}

export function handleError(err: unknown, endpoint?: string): McpErrorResult {
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
