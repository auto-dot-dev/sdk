import { Command } from 'commander'
import { getValidToken } from '../auth/oauth'
import { loadConfig } from '../core/config'
import { resolveRaw, stripMetadata } from '../core/strip'
import { brand, brown, formatError, formatSuccess, hint, label, limeGreen, purple, red, value, yellowNum } from './colors'
import { createSpinner } from './spinner'

const BASE_URL = process.env.AUTODEV_BASE_URL ?? 'https://api.auto.dev'

// ── Types ──────────────────────────────────────────────────────────────

export interface ArgDef {
  name: string
  desc: string
  optional?: boolean
}

export interface OptionDef {
  flags: string
  description: string
}

export type QueryParamMap = Record<string, string>

export interface CommandDef {
  name: string
  description: string
  args?: ArgDef[]
  endpoint: string | ((...args: string[]) => string)
  extraOptions?: OptionDef[]
  queryParams?: QueryParamMap
}

const DEFAULT_ARGS: ArgDef[] = [{ name: 'vin', desc: 'Vehicle Identification Number' }]

// ── Factory ────────────────────────────────────────────────────────────

export function makeCommand(def: CommandDef): Command {
  const args = def.args ?? DEFAULT_ARGS

  const cmd = new Command(def.name).description(def.description)

  // Register positional arguments
  for (const arg of args) {
    const bracket = arg.optional ? `[${arg.name}]` : `<${arg.name}>`
    cmd.argument(bracket, arg.desc)
  }

  // Standard output options
  outputOptions(cmd)

  // Extra options
  if (def.extraOptions) {
    for (const opt of def.extraOptions) {
      cmd.option(opt.flags, opt.description)
    }
  }

  // Action handler
  cmd.action(async (...actionArgs: unknown[]) => {
    // Commander passes: positional args, options object, Command instance
    const options = actionArgs[actionArgs.length - 2] as Record<string, string>
    const positionalArgs = actionArgs.slice(0, args.length) as (string | undefined)[]

    const apiKey = await getApiKey(options)

    // Build endpoint path
    let path: string
    if (typeof def.endpoint === 'function') {
      const definedArgs = positionalArgs.filter((a): a is string => a !== undefined)
      path = def.endpoint(...definedArgs)
    } else {
      // String endpoint — append positional args that have values
      const definedArgs = positionalArgs.filter((a): a is string => a !== undefined)
      path = definedArgs.length > 0
        ? `${def.endpoint}/${definedArgs.join('/')}`
        : def.endpoint
    }

    // Build query params from extraOptions + queryParams mapping
    if (def.queryParams) {
      const params = new URLSearchParams()
      for (const [optKey, paramKey] of Object.entries(def.queryParams)) {
        const val = options[optKey]
        if (val !== undefined) {
          params.set(paramKey, val)
        }
      }
      const query = params.toString()
      if (query) path += `?${query}`
    }

    const data = await apiGet(path, apiKey, {
      raw: !!options.raw,
      suppressSpinner: shouldSuppressSpinner(options),
    })
    console.log(formatOutput(data, getFormat(options)))
  })

  return cmd
}

// ── Helpers (moved from commands.ts) ───────────────────────────────────

async function getApiKey(options: Record<string, string>): Promise<string> {
  const apiKey =
    options.apiKey ??
    process.env.AUTODEV_API_KEY ??
    await getValidToken()

  if (!apiKey) {
    console.error(formatError('No API key found', 'Set AUTODEV_API_KEY or run: auto login'))
    process.exit(1)
  }

  return apiKey as string
}

async function apiGet(path: string, apiKey: string, options?: { raw?: boolean; suppressSpinner?: boolean }): Promise<unknown> {
  const url = `${BASE_URL}${path}`
  if (process.env.DEBUG) {
    console.error(`[DEBUG] GET ${url}`)
    console.error(`[DEBUG] Token: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`)
  }
  const spinner = options?.suppressSpinner ? { stop() {} } : createSpinner()
  const start = Date.now()
  let response: Response
  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    })
  } catch (err) {
    spinner.stop()
    throw err
  }
  const elapsed = ((Date.now() - start) / 1000).toFixed(2)

  spinner.stop()
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText }))

    if (response.status === 402) {
      const upgradeLink = body?.upgradeLink ?? 'https://auto.dev/pricing'
      const tier = upgradeLink.match(/tier=(\w+)/)?.[1] ?? 'a higher'
      const endpointName = path.split('?')[0]!.split('/').filter(Boolean)[0] ?? path
      console.error(formatError(`${label(endpointName)} requires a ${purple(tier)} plan`))
      console.error(`\n  ${hint('Upgrade your plan:')} ${limeGreen(upgradeLink)}`)
      console.error(`  ${hint('Manage account:')}   ${limeGreen('https://auto.dev/dashboard')}\n`)
      process.exit(1)
    }

    let errorMsg: string
    if (body?.error && typeof body.error === 'object' && body.error.error) {
      errorMsg = body.error.error
    } else if (typeof body?.error === 'string') {
      errorMsg = body.error
    } else if (typeof body?.message === 'string') {
      errorMsg = body.message
    } else {
      errorMsg = response.statusText
    }
    console.error(formatError(`${response.status}: ${errorMsg}`))
    process.exit(1)
  }
  const endpoint = path.split('?')[0]!.split('/').filter(Boolean)[0] ?? path
  console.error(formatSuccess(`${brand(endpoint)}  ${hint(String(response.status))}  ${hint(`${elapsed}s`)}`))
  console.error()
  const data = await response.json() as Record<string, unknown>
  const config = loadConfig()
  const isRaw = resolveRaw({
    consumer: options?.raw,
    config: config.raw,
  })
  return isRaw ? data : stripMetadata(data)
}

export function colorizeJson(json: string): string {
  return json
    .replace(/"([^"]+)":/g, (_, key) => `${value(`"${key}"`)}:`)
    .replace(/: "(https?:\/\/[^"]+)"/g, (_, url) => `: "${limeGreen(url)}"`)
    // biome-ignore lint/suspicious/noControlCharactersInRegex: intentional — prevents re-colorizing ANSI-escaped strings
    .replace(/: "([^"\x1b]*)"/g, (_, str) => `: ${brown(`"${str}"`)}`)
    .replace(/: (-?\d+\.?\d*)(,?\n)/g, (_, num, end) => `: ${yellowNum(num)}${end}`)
    .replace(/: (true|false)(,?\n)/g, (_, bool, end) => `: ${yellowNum(bool)}${end}`)
    .replace(/: (null)(,?\n)/g, (_, nul, end) => `: ${yellowNum(nul)}${end}`)
    .replace(/^(\s+)(-?\d+\.?\d*)(,?\n)/gm, (_, indent, num, end) => `${indent}${yellowNum(num)}${end}`)
}

export function formatOutput(data: unknown, format: string): string {
  if (format === 'json') {
    return JSON.stringify(data, null, 2)
  }
  if (format === 'yaml') {
    return toYaml(data, 0)
  }
  if (Array.isArray(data)) {
    if (data.length === 0) return '(no results)'
    const hasNested = Object.values(data[0] as object).some((v) => typeof v === 'object' && v !== null)
    if (hasNested) return colorizeJson(JSON.stringify(data, null, 2))
    const keys = Object.keys(data[0] as object)
    const rows = (data as Record<string, unknown>[]).map((row) =>
      keys.map((k) => String(row[k] ?? '')).join('\t'),
    )
    return [keys.join('\t'), ...rows].join('\n')
  }
  return colorizeJson(JSON.stringify(data, null, 2))
}

function toYaml(obj: unknown, indent: number): string {
  const pad = ' '.repeat(indent)
  if (obj === null || obj === undefined) return `${pad}null`
  if (typeof obj === 'string') return `${pad}${obj}`
  if (typeof obj === 'number' || typeof obj === 'boolean') return `${pad}${obj}`
  if (Array.isArray(obj)) {
    return obj.map((item) => `${pad}- ${toYaml(item, 0).trimStart()}`).join('\n')
  }
  if (typeof obj === 'object') {
    return Object.entries(obj as Record<string, unknown>)
      .map(([k, v]) => {
        if (typeof v === 'object' && v !== null) {
          return `${pad}${k}:\n${toYaml(v, indent + 2)}`
        }
        return `${pad}${k}: ${v}`
      })
      .join('\n')
  }
  return `${pad}${String(obj)}`
}

function outputOptions(cmd: Command): Command {
  return cmd
    .option('--json', 'Output as JSON')
    .option('--table', 'Output as table (default)')
    .option('--yaml', 'Output as YAML')
    .option('--raw', 'Show full API response including metadata')
    .option('--api-key <key>', 'API key (overrides stored credentials)')
}

function getFormat(options: Record<string, unknown>): string {
  if (options.json) return 'json'
  if (options.yaml) return 'yaml'
  return 'table'
}

export function shouldSuppressSpinner(options: Record<string, unknown>): boolean {
  return !!(options.json || options.yaml || options.raw)
}
