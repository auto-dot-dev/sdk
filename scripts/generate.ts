#!/usr/bin/env npx tsx

/**
 * Fetches the OpenAPI spec from api.auto.dev/openapi and regenerates
 * src/core/types.generated.ts with response types from the spec.
 *
 * Run: pnpm generate
 *
 * Note: endpoints.ts and client.ts are hand-maintained.
 * This script only updates types.ts with the latest response schemas.
 */

import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OPENAPI_URL = process.argv[2] ?? 'https://api.auto.dev/openapi'
const OUTPUT_PATH = resolve(__dirname, '../src/core/types.generated.ts')

interface OpenApiSchema {
  paths: Record<string, Record<string, { responses?: Record<string, { content?: Record<string, { schema: unknown }> }> }>>
  components?: { schemas?: Record<string, unknown> }
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

  // Generate interfaces from component schemas
  for (const [name, schema] of Object.entries(schemas)) {
    output += `/** ${name} */\n`
    output += `export interface ${name} ${JSON.stringify(schema, null, 2)}\n\n`
  }

  // List discovered paths
  output += '// Discovered paths:\n'
  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const method of Object.keys(methods)) {
      output += `// ${method.toUpperCase()} ${path}\n`
    }
  }

  writeFileSync(OUTPUT_PATH, output, 'utf-8')
  console.log(`Generated ${OUTPUT_PATH}`)
  console.log(`Found ${Object.keys(schemas).length} schemas and ${Object.keys(spec.paths).length} paths`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
