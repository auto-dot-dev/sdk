import { Command } from 'commander'
import { resolveAuth } from '../auth/resolve'
import { AutoDevClient } from '../core/client'
import { AutoDevError } from '../errors'
import { brand, brown, formatError, formatSuccess, hint, label, limeGreen, purple, value, yellowNum } from './colors'
import { createSpinner } from './spinner'

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
  endpointKey?: string
  extraOptions?: OptionDef[]
  queryParams?: QueryParamMap
}

const DEFAULT_ARGS: ArgDef[] = [{ name: 'vin', desc: 'Vehicle Identification Number' }]

/** Convert hyphenated command name to camelCase endpoint key */
function toCamelCase(name: string): string {
  return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}

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

    const suppress = shouldSuppressSpinner(options)
    const spinner = suppress ? { stop() {} } : createSpinner()

    try {
      const client = new AutoDevClient({
        apiKey: () => resolveAuth({ apiKey: options.apiKey }),
        baseUrl: process.env.AUTODEV_BASE_URL,
        raw: !!options.raw,
      })

      // Build params from positional args
      const params: Record<string, unknown> = {}
      for (let i = 0; i < args.length; i++) {
        const argVal = positionalArgs[i]
        if (argVal !== undefined) {
          params[args[i]!.name] = argVal
        }
      }

      // Build query from queryParams mapping
      if (def.queryParams) {
        const query: Record<string, string> = {}
        for (const [optKey, paramKey] of Object.entries(def.queryParams)) {
          const val = options[optKey]
          if (val !== undefined) {
            query[paramKey] = val
          }
        }
        if (Object.keys(query).length > 0) {
          params.query = query
        }
      }

      const endpointKey = def.endpointKey ?? toCamelCase(def.name)
      const start = Date.now()
      const { data } = await client.request(endpointKey, params)
      const elapsed = ((Date.now() - start) / 1000).toFixed(2)

      spinner.stop()

      const endpoint = def.name
      console.error(formatSuccess(`${brand(endpoint)}  ${hint('200')}  ${hint(`${elapsed}s`)}`))
      console.error()
      console.log(formatOutput(data, getFormat(options)))
    } catch (err) {
      spinner.stop()
      if (err instanceof AutoDevError) {
        console.error(formatError(`${err.status}: ${err.message}`))
        if (err.suggestion) {
          console.error(`\n  ${hint(err.suggestion)}\n`)
        }
        process.exit(1)
      }
      throw err
    }
  })

  return cmd
}

// ── Helpers (moved from commands.ts) ───────────────────────────────────

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
    const allRows = (data as Record<string, unknown>[]).map((row) =>
      keys.map((k) => String(row[k] ?? '')),
    )
    const colWidths = keys.map((k, i) =>
      Math.max(k.length, ...allRows.map((r) => r[i]!.length)),
    )
    const pad = (s: string, w: number) => s + ' '.repeat(Math.max(0, w - s.length))
    const header = keys.map((k, i) => label(pad(k, colWidths[i]!))).join('  ')
    const body = allRows.map((row) =>
      row.map((val, i) => pad(val, colWidths[i]!)).join('  '),
    )
    return [header, ...body].join('\n')
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
