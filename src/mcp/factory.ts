import type { z } from 'zod'
import { AutoDevError } from '../errors'

export interface McpToolDef {
  endpoint: string
  params: Record<string, z.ZodType>
  queryMap?: Record<string, string>
}

export type McpErrorResult = { content: { type: 'text'; text: string }[] }

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
