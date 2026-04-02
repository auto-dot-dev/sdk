#!/usr/bin/env npx tsx

/**
 * Fetches the OpenAPI spec from api.auto.dev/openapi and regenerates
 * src/core/types.generated.ts with response types and request param types.
 *
 * Run: pnpm generate
 *
 * Note: endpoints.ts and client.ts are hand-maintained.
 * This script generates both response schemas and request parameter interfaces.
 */

import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OPENAPI_URL = process.argv[2] ?? 'https://api.auto.dev/openapi'
const OUTPUT_PATH = resolve(__dirname, '../src/core/types.generated.ts')

interface OpenApiParameter {
  name: string
  in: 'path' | 'query' | 'header'
  required?: boolean
  description?: string
  schema?: { type?: string }
}

interface OpenApiOperation {
  parameters?: OpenApiParameter[]
  responses?: Record<string, { content?: Record<string, { schema: unknown }> }>
}

interface OpenApiSchema {
  paths: Record<string, Record<string, OpenApiOperation>>
  components?: { schemas?: Record<string, unknown> }
}

function toTsType(schemaType?: string): string {
  switch (schemaType) {
    case 'integer':
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    default:
      return 'string'
  }
}

function toPascalCase(str: string): string {
  return str
    .replace(/[{}]/g, '')
    .split(/[/\-_]/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
}

async function main() {
  console.log(`Fetching OpenAPI spec from ${OPENAPI_URL}...`)
  const response = await fetch(OPENAPI_URL)

  if (!response.ok) {
    console.error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`)
    process.exit(1)
  }

  const spec = (await response.json()) as OpenApiSchema
  const schemas = spec.components?.schemas ?? {}

  let output = '// Auto-generated from OpenAPI spec — do not edit manually\n'
  output += '// Run: pnpm generate\n\n'

  // ── Response types from component schemas ──────────────────────────

  output += '// ── Response Types ──────────────────────────────────────────────────\n\n'

  for (const [name, schema] of Object.entries(schemas)) {
    output += `/** ${name} */\n`
    output += `export interface ${name} ${JSON.stringify(schema, null, 2)}\n\n`
  }

  // ── Request param types from path parameters ───────────────────────

  output += '// ── Request Parameter Types ─────────────────────────────────────────\n\n'

  let paramInterfaceCount = 0

  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      const params = operation.parameters?.filter((p) => p.in === 'query') ?? []
      if (params.length === 0) continue

      const interfaceName = `${toPascalCase(path)}Params`
      paramInterfaceCount++

      output += `/** ${method.toUpperCase()} ${path} query parameters */\n`
      output += `export interface ${interfaceName} {\n`

      for (const param of params) {
        const tsType = toTsType(param.schema?.type)
        const optional = param.required ? '' : '?'
        if (param.description) {
          output += `  /** ${param.description} */\n`
        }
        const propName = param.name.includes('.') ? `'${param.name}'` : param.name
        output += `  ${propName}${optional}: ${tsType}\n`
      }

      output += '}\n\n'
    }
  }

  // ── Discovered paths ───────────────────────────────────────────────

  output += '// ── Discovered Paths ────────────────────────────────────────────────\n'
  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const method of Object.keys(methods)) {
      output += `// ${method.toUpperCase()} ${path}\n`
    }
  }
  output += '\n'

  writeFileSync(OUTPUT_PATH, output, 'utf-8')
  console.log(`Generated ${OUTPUT_PATH}`)
  console.log(`Found ${Object.keys(schemas).length} response schemas, ${paramInterfaceCount} param interfaces, and ${Object.keys(spec.paths).length} paths`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
