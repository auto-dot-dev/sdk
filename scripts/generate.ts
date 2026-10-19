#!/usr/bin/env npx tsx

/**
 * Fetches the OpenAPI spec from api.auto.dev/openapi and regenerates
 * src/core/types.generated.ts with response types and request param types.
 *
 * Run: pnpm generate [url-or-path]
 *
 * Note: endpoints.ts and client.ts are hand-maintained. The spec documents one 200 per route, so
 * /build's 207 and `missing[]` live by hand in src/core/types.build.ts (auto-dot-dev/sdk#14).
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { type OpenApiSpec, renderSpec } from './openapi-to-ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SOURCE = process.argv[2] ?? 'https://api.auto.dev/openapi'
const OUTPUT_PATH = resolve(__dirname, '../src/core/types.generated.ts')

async function loadSpec(source: string): Promise<OpenApiSpec> {
  if (existsSync(source)) {
    console.log(`Reading OpenAPI spec from ${source}...`)
    return JSON.parse(readFileSync(source, 'utf-8')) as OpenApiSpec
  }

  console.log(`Fetching OpenAPI spec from ${source}...`)
  const response = await fetch(source)
  if (!response.ok) {
    console.error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`)
    process.exit(1)
  }
  return (await response.json()) as OpenApiSpec
}

async function main() {
  const spec = await loadSpec(SOURCE)
  const output = renderSpec(spec)
  writeFileSync(OUTPUT_PATH, output, 'utf-8')

  const schemaCount = Object.keys(spec.components?.schemas ?? {}).length
  const paramCount = Object.values(spec.paths)
    .flatMap((methods) => Object.values(methods))
    .filter((op) => op.parameters?.some((p) => p.in === 'query')).length
  console.log(`Generated ${OUTPUT_PATH}`)
  console.log(
    `Found ${schemaCount} response schemas, ${paramCount} param interfaces, and ${Object.keys(spec.paths).length} paths`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
